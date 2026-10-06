"use client"
import { Button } from '@/components/ui/button'
import { IconArrowRight } from '@tabler/icons-react'
import Image from 'next/image'
import React, { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader } from 'lucide-react'
import { useContext } from 'react'
import { UserDetailCotext } from '@/context/UserDetailContext'


export type doctorAgent={
    id:number,
    specialist:string,
    description:string,
    image:string,
    agentPrompt:string,
    voiceId:string
}
type props={
    doctorAgent:doctorAgent
}
function DoctorsAgentCard({doctorAgent}:props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const {UserDetail, setUserDetail} = useContext(UserDetailCotext);

  const StartConsultation = async () => {
    if (UserDetail?.credits <= 0) {
      toast.error('You have run out of credits. Please upgrade your plan.');
      return;
    }

    setLoading(true);
    try {
      const result = await axios.post('/api/session-chat', {
        notes: '',
        selectedDoctor: doctorAgent
      });

      // Update local credits
      setUserDetail({
          ...UserDetail,
          credits: UserDetail.credits - 1
      });

      if (result.data?.sessionId) {
        router.push('/dashboard/medical-agent/' + result.data.sessionId);
      } else {
        toast.error('Failed to start consultation');
      }
    } catch (e: any) {
      console.error(e);
      if (e.response?.status === 403) {
        toast.error('Insufficient Credits: ' + (e.response?.data?.details || 'Please contact support.'));
      } else {
        toast.error('Failed to start consultation. Check your database connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="group h-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5">
      <div className="relative overflow-hidden">
        <Image src={doctorAgent.image} alt={doctorAgent.specialist} width={400} height={320} className='h-[190px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] sm:h-[210px]'/>
        <div className="absolute bottom-3 left-3 rounded-full border border-white/30 bg-black/45 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md">AI specialist</div>
      </div>
      <div className="p-4">
      <h2 className='font-semibold tracking-tight'>{doctorAgent.specialist}</h2>
      <p className='mt-1.5 line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground'>{doctorAgent.description}</p>
      <Button className='mt-4 w-full rounded-xl' onClick={StartConsultation} disabled={loading}>
        {loading ? <Loader className='animate-spin mr-2' /> : null}
        Start Consultation <IconArrowRight/>
      </Button>
      </div>
    </article>
  )
}

export default DoctorsAgentCard
