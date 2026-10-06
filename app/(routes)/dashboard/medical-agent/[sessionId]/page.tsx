"use client"
import axios from 'axios';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react'
import { doctorAgent } from '../../_components/DoctorsAgentCard';
import { AIDoctorAgents } from '@/shared/list';
import { Circle, Loader, PhoneCall, PhoneOff } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Vapi from '@vapi-ai/web';
import { toast } from 'sonner';
import { AIDoctorAgents as AgentsList } from '@/shared/list';

export type sessionDetail={
    id:number,
    notes:string,
    sessionId:string,
    report:JSON
    selectedDoctor:doctorAgent,
    createdOn:string
}

type messages={
  role:string,
  text:string
}

function MedicalVoiceAgent() {
  const { sessionId } = useParams();
  const searchParams = useSearchParams();
  const [sessionDetail, setSessionDetail] = useState<sessionDetail>();
  const [callStarted, setCallStarted] = useState(false);
  const [vapiInstance, setVapiInstance] = useState<Vapi | null>(null);
  const [currentRole, setCurrentRole] = useState<string|null>();
  const [liveTranscript, setLiveTranscript] = useState<string>();
  const [messages, setMessages] = useState<messages[]>([]);
  const [loading, setLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<doctorAgent[]>([]);
  const [isRecommendedSession, setIsRecommendedSession] = useState(false);
  const messagesRef = useRef<messages[]>([]);
  const recommendationsRef = useRef<doctorAgent[]>([]);
  const reportPromiseRef = useRef<Promise<any> | null>(null);
  const finalizationPromiseRef = useRef<Promise<void> | null>(null);
  const switchingRef = useRef(false);
  // Removed timer tracking
  const router= useRouter();

  


  useEffect(() => {
    sessionId && GetSessionDetails();
    // Check if this session was started via recommendation
    const recommended = searchParams.get('recommended');
    setIsRecommendedSession(recommended === 'true');
  },[sessionId, searchParams]);

  const GetSessionDetails= async ()=>{
    try {
      const result = await axios.get(`/api/session-chat?sessionId=${sessionId}`);
      setSessionDetail(result.data);
      if (!result.data) toast.error('This consultation was not found.');
    } catch {
      toast.error('Unable to load the consultation.');
    }
  }

// Removed timer functions

// Define the listeners as named functions above StartCall
const handleCallStart = () => {
  console.log('Call started');
  setCallStarted(true);
};

const handleCallEnd = () => {
  setCallStarted(false);
  console.log('Call ended');

  if (!switchingRef.current) {
    window.setTimeout(() => {
      void finalizeReport().catch((error) => {
        console.error('Automatic report generation could not complete:', error);
      });
    }, 500);
  }

  // Save consultation data
  if (sessionDetail?.selectedDoctor) {
    const consultationData = {
      specialist: sessionDetail.selectedDoctor.specialist,
      duration: 0,
      timestamp: new Date().toISOString()
    };

    // Get existing stats
    const existingStats = JSON.parse(localStorage.getItem('consultationStats') || '{}');
    const stats = {
      totalConsultations: (existingStats.totalConsultations || 0) + 1,
      totalTimeSpent: (existingStats.totalTimeSpent || 0),
      lastConsultation: consultationData.timestamp,
      assistantUsage: {
        ...existingStats.assistantUsage,
        [consultationData.specialist]: {
          count: (existingStats.assistantUsage?.[consultationData.specialist]?.count || 0) + 1,
          totalTime: (existingStats.assistantUsage?.[consultationData.specialist]?.totalTime || 0)
        }
      }
    };

    localStorage.setItem('consultationStats', JSON.stringify(stats));
  }
};
const handleMessage = (message: any) => {
  if (message.type === 'transcript') {
    const {role, transcriptType, transcript} = message;
    console.info('Vapi transcript event', {
      role,
      transcriptType,
      transcriptLength: typeof transcript === 'string' ? transcript.length : 0,
    });
    
    if(transcriptType === 'partial') {
      setLiveTranscript(transcript);
      setCurrentRole(role);
    }
    else if(transcriptType === 'final') {
      const sanitized = typeof transcript === 'string' ? transcript.replaceAll('[END_CALL]', '').trim() : transcript;
      
      if (sanitized && (role === 'user' || role === 'assistant')) {
        const nextMessage = { role, text: sanitized };
        messagesRef.current = [...messagesRef.current, nextMessage];
        setMessages(messagesRef.current);

        // Detect assistant recommendations of other specialists
        if (role === 'assistant' && typeof sanitized === 'string') {
          const lower = sanitized.toLowerCase();
          const mentioned = AgentsList.filter(a =>
            lower.includes(a.specialist.toLowerCase()) &&
            a.specialist.toLowerCase() !== (sessionDetail?.selectedDoctor?.specialist || '').toLowerCase()
          );
          if (mentioned.length > 0) {
            const nextRecommendations = [...new Map(
              [...recommendationsRef.current, ...mentioned].map((doctor) => [doctor.id, doctor]),
            ).values()];
            recommendationsRef.current = nextRecommendations;
            setRecommendations(nextRecommendations);
          }
        }
      }
      
      setLiveTranscript("");
      setCurrentRole(null);
      
      // If assistant requested to end the call, stop after a brief delay
       if (role === 'assistant' && typeof transcript === 'string' && transcript.includes('[END_CALL]')) {
         setTimeout(() => {
           if (recommendationsRef.current.length === 0) {
             void endCall();
           }
         }, 500);
       }
    }
  }
};

// In StartCall, use these functions
const StartCall = () => {
	setLoading(true);
  messagesRef.current = [];
  recommendationsRef.current = [];
  setMessages([]);
  setRecommendations([]);
  reportPromiseRef.current = null;
  finalizationPromiseRef.current = null;
  setReportError(null);

	const publicApiKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
	if (!publicApiKey) {
		toast.error('Voice service is not configured.');
		setLoading(false);
		return;
	}

	if (!sessionDetail?.selectedDoctor) {
		console.error('Missing selected doctor configuration');
		setLoading(false);
		return;
	}

	const vapi = new Vapi(publicApiKey);
	setVapiInstance(vapi);

	// Build assistant config per Vapi Web SDK schema (used if no assistantId is provided)
	const inlineAssistantConfig: Exclude<Parameters<Vapi['start']>[0], string | undefined> = (() => {
		console.log('Full sessionDetail:', sessionDetail);
		console.log('Selected doctor object:', sessionDetail.selectedDoctor);
		
		const rawVoiceId = String(sessionDetail.selectedDoctor?.voiceId || '').trim();
		console.log('Raw voice ID from session:', rawVoiceId);
		console.log('Selected doctor specialist:', sessionDetail.selectedDoctor?.specialist);
		
		// If voiceId is empty, get it from the list based on specialist
		let normalizedVoiceId = rawVoiceId;
		if (!normalizedVoiceId) {
			// Find the voice ID from the list by specialist
			const doctorFromList = AIDoctorAgents.find(doc => 
				doc.specialist.toLowerCase() === sessionDetail.selectedDoctor?.specialist?.toLowerCase()
			);
			normalizedVoiceId = doctorFromList?.voiceId || '';
			console.log('Found voice ID from list:', normalizedVoiceId);
		}
		
		console.log('Final voice ID being used:', normalizedVoiceId);
		console.log('Voice ID length:', normalizedVoiceId.length);
		
		const specialty = String(sessionDetail.selectedDoctor.specialist || '').trim();
		
		// Special debugging for Dentist
		if (specialty.toLowerCase() === 'dentist') {
			console.log('=== DENTIST DEBUG ===');
			console.log('Dentist voice ID:', normalizedVoiceId);
			console.log('Dentist specialist:', specialty);
			console.log('Dentist agent prompt:', sessionDetail.selectedDoctor.agentPrompt);
		}
		const isGeneralPhysician = specialty.toLowerCase() === 'general physician';
		
		let scopeGuard;
		if (isGeneralPhysician) {
			scopeGuard = `You are a General Physician AI assistant. You can help with basic diseases, common symptoms, general health concerns, and provide initial diagnosis guidance. You handle a wide range of medical topics and can offer general medical advice. Keep responses brief, helpful, and always recommend seeing a doctor for serious conditions.`;
		} else {
			const topic = specialty.toLowerCase() === 'cardiologist' ? 'the heart and cardiovascular system' : specialty.toLowerCase();
			const availableSpecialists = 'General Physician, Pediatrician, Dermatologist, Psychologist, Nutritionist, Cardiologist, ENT Specialist, Orthopedic, Gynecologist, Dentist';
			scopeGuard = `You are acting strictly as a ${specialty}. Only answer questions directly related to ${topic}. If the user asks about anything unrelated, immediately (1) politely decline, (2) recommend the correct specialist from this list if possible: ${availableSpecialists}, and (3) explicitly say you will transfer/end this call now because you only have information for ${specialty}. After your final sentence, append the exact token [END_CALL]. Keep replies brief, safe, and professional.`;
		}

		return {
			name: 'AI Medical Doctor Voice Agent',
			firstMessage:
				"Hello, I am your AI medical assistant. I am here to help you with any health-related questions or concerns you may have. How are you feeling?",
			transcriber: {
				provider: 'assembly-ai',
				language: 'en',
			},
			voice: {
				provider: '11labs',
				voiceId: normalizedVoiceId,
			},
			model: {
				provider: 'openai',
				model: 'gpt-4.1-mini',
				messages: [
					{ role: 'system', content: scopeGuard },
					{ role: 'system', content: sessionDetail.selectedDoctor.agentPrompt },
				],
			},
		};
	})();

	// Surface detailed errors from the SDK/API
	vapi.on('error', async (err: any) => {
		try {
			if (err?.error instanceof Response) {
				const clone = err.error.clone();
				const text = await clone.text();
				console.error('Vapi error response body:', text);
			}
		} catch {}
		console.error('Vapi error event:', err);
		setLoading(false);
	});

  //@ts-ignore
	// Always use inline config to ensure voice IDs from list.tsx are applied
	vapi.start(inlineAssistantConfig);
	vapi.on('call-start', handleCallStart);
	vapi.on('call-end', handleCallEnd);
	vapi.on('message', handleMessage);

	vapi.on('speech-start', () => {
		console.log('Assistant started speaking');
		setCurrentRole('assistant');
	});
	vapi.on('speech-end', () => {
		console.log('Assistant stopped speaking');
		setCurrentRole('user');
	});
};

// In endCall, use the same references
const endCall =async () => {
  setLoading(true);
  if (!vapiInstance) {
    setLoading(false);
    return;
  }

  let reportSaved = false;
  try {
    await vapiInstance.stop();
    await new Promise((resolve) => window.setTimeout(resolve, 500));
    await finalizeReport();
    reportSaved = true;
  } catch (error) {
    console.error('Consultation report generation failed after disconnect:', error);
    setReportError('The consultation ended, but its report could not be generated. Please retry.');
    toast.error('The call ended, but the report could not be generated. Please retry.');
  } finally {
    vapiInstance.off('call-start', handleCallStart);
    vapiInstance.off('call-end', handleCallEnd);
    vapiInstance.off('message', handleMessage);
    setCallStarted(false);
    setVapiInstance(null);
    setLoading(false);
    if (reportSaved && recommendationsRef.current.length === 0) {
      router.replace('/dashboard');
    }
  }
};

const endCallWithoutRedirect = async () => {
  setLoading(true);
  if (vapiInstance) {
    vapiInstance.stop();
    vapiInstance.off('call-start', handleCallStart);
    vapiInstance.off('call-end', handleCallEnd);
    vapiInstance.off('message', handleMessage);
    setCallStarted(false);
    setVapiInstance(null);
  }
  setLoading(false);
};

const switchToRecommended = async (recommendedDoctor: doctorAgent) => {
  try {
    setLoading(true);

    // End current call immediately when switching
    if (callStarted && vapiInstance) {
      switchingRef.current = true;
      await vapiInstance.stop();
      await new Promise((resolve) => window.setTimeout(resolve, 300));
      vapiInstance.off('call-start', handleCallStart);
      vapiInstance.off('call-end', handleCallEnd);
      vapiInstance.off('message', handleMessage);
      setCallStarted(false);
      setVapiInstance(null);
    }

    // Generate report for current session before switching (if there are messages)
    if (messagesRef.current.length > 0) {
      try {
        await GenerateReport(messagesRef.current);
      } catch (e) {
        console.error('Report generation failed during specialist switch:', e);
        toast.error('The previous consultation report could not be saved.');
      }
    }

    const result = await axios.post('/api/session-chat', {
      notes: sessionDetail?.notes || '',
      selectedDoctor: recommendedDoctor
    });
    if (result.data?.sessionId) {
      // Clear recommendations and navigate to new session
      recommendationsRef.current = [];
      setRecommendations([]);
      router.push('/dashboard/medical-agent/' + result.data.sessionId + '?recommended=true');
    } else {
      toast.error('Failed to start new session');
    }
  } catch(e){
    toast.error('Failed to start new session');
  } finally{
    switchingRef.current = false;
    setLoading(false);
  }
}


const GenerateReport = async (transcript: messages[] = messagesRef.current) => {
  if (reportPromiseRef.current) return reportPromiseRef.current;
  if (transcript.length === 0) {
    throw new Error('No finalized Vapi transcript is available for report generation.');
  }

  const request = axios.post('/api/medical-report', {
    message: transcript,
    sessionId,
  }).then((result) => {
    setSessionDetail((current) => current ? {
      ...current,
      conversation: transcript,
      report: result.data,
    } : current);
    setReportError(null);
    console.info('Consultation report generated and saved', {
      sessionId,
      transcriptMessages: transcript.length,
    });
    return result.data;
  }).catch((error) => {
    reportPromiseRef.current = null;
    console.error('Consultation report request failed', {
      sessionId,
      status: error?.response?.status,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  });

  reportPromiseRef.current = request;
  return request;
};

const finalizeReport = (): Promise<void> => {
  if (finalizationPromiseRef.current) return finalizationPromiseRef.current;

  const task = (async () => {
    setLoading(true);
    try {
      await GenerateReport(messagesRef.current);
      toast.success('Your consultation report has been generated and saved.');
      if (recommendationsRef.current.length === 0) router.replace('/dashboard');
    } catch (error) {
      console.error('Automatic report generation failed', { sessionId, error });
      setReportError('The consultation ended, but its report could not be generated. Please retry.');
      toast.error('The consultation ended, but its report could not be generated. Please retry.');
      throw error;
    } finally {
      setLoading(false);
    }
  })();

  finalizationPromiseRef.current = task.catch((error) => {
    finalizationPromiseRef.current = null;
    throw error;
  });
  return finalizationPromiseRef.current;
}

const retryReport = async () => {
  setLoading(true);
  try {
    await GenerateReport(messagesRef.current);
    toast.success('Your consultation report has been generated and saved.');
    if (recommendationsRef.current.length === 0) router.replace('/dashboard');
  } catch (error) {
    console.error('Consultation report retry failed:', error);
    setReportError('The consultation report could not be generated. Please try again.');
    toast.error('The consultation report could not be generated. Please try again.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className='p-5 border rounded-3xl bg-secondary'>
        <div className='flex justify-between items-center '>
          <h2 className='p-1 px-2 border rounded-md flex gap-2 items-center'><Circle className={`h-4 w-4 rounded-full ${callStarted ? 'bg-green-500':'bg-red-600'}`}/>{callStarted?'Connected...':'Not connected'}</h2>
        </div>

        {!sessionDetail ? (
          <div className='flex flex-col items-center justify-center p-20 py-40'>
              <Loader className='animate-spin h-12 w-12 text-blue-600' />
              <p className='mt-4 text-gray-500 animate-pulse'>Loading Consultation Details...</p>
          </div>
        ) : (
          <div className='flex flex-col items-center mt-10'>
             <Image src={sessionDetail?.selectedDoctor?.image} alt={sessionDetail?.selectedDoctor?.specialist??''} width={120} height={120} className={`h-[100px] w-[100px] object-cover rounded-full ${isRecommendedSession ? 'animate-pulse ring-4 ring-blue-500 ring-opacity-75' : ''}`} />

            <h2 className=' text-lg mt-2'>{sessionDetail?.selectedDoctor?.specialist}</h2>
            <p className='text-sm text-gray-400 '>AI medical Voice Agent</p>

            <div className='mt-12 overflow-y-auto flex flex-col items-center px-10 md:px-28 lg:px-52 xl:px-72 w-full'>
              {messages?.slice(-4).map((msg:messages,index)=>(
                  <h2 className='text-gray-400 p-2' key={index}>{msg.role} : {msg.text}</h2>
              ))}
              
              {liveTranscript && liveTranscript?.length>0 && <h2 className='text-lg'>{currentRole} : {liveTranscript}</h2>}

              {recommendations.length > 0 && (
                <div className='fixed inset-0 flex items-center justify-center z-50'>
                  <div className='bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full mx-4'>
                    <h3 className='font-semibold mb-4 text-center'>Recommended Specialists</h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      {recommendations.map((rec, index) => (
                        <div key={index} className='p-4 border rounded-lg bg-white/50'>
                          <div className='flex flex-col gap-3'>
                            <div className='flex items-center gap-3'>
                              <Image
                                src={rec.image}
                                alt={rec.specialist}
                                width={40}
                                height={40}
                                className='h-10 w-10 object-cover rounded-full'
                              />
                              <div>
                                <p className='font-medium'>{rec.specialist}</p>
                                <p className='text-sm text-gray-500'>{rec.description}</p>
                              </div>
                            </div>
                            <Button
                              size={'sm'}
                              onClick={() => switchToRecommended(rec)}
                              disabled={false}
                              className='w-full'
                            >
                              Switch to {rec.specialist}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {reportError && (
              <div role="alert" className="mt-8 w-full max-w-xl rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
                <p>{reportError}</p>
                <Button className="mt-3" variant="outline" onClick={retryReport} disabled={loading || messagesRef.current.length === 0}>
                  {loading ? <Loader className="animate-spin" /> : null}
                  Retry report generation
                </Button>
              </div>
            )}

            {!callStarted ? 
            <Button className='mt-20' onClick={StartCall} disabled={loading || Boolean(reportError)}>
              {loading ? <Loader className='animate-spin'/>:<PhoneCall/>} Start Call
              </Button>
            :<Button variant={'destructive'} onClick={endCall} >
              {loading ? <Loader className='animate-spin'/>:
              <PhoneOff/>} Disconnect
              </Button>
            }
          </div>
        )}
    </div>
  )
}


export default MedicalVoiceAgent
