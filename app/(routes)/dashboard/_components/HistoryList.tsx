"use client"
import Image from 'next/image';
import React, { useEffect, useState } from 'react'
import AddNewSessionDialog from './AddNewSessionDialog';

import axios from 'axios';
import HistoryTable from './HistoryTable';
import { sessionDetail } from '../medical-agent/[sessionId]/page';
import { Loader2 } from 'lucide-react';

function HistoryList() {
    const [HistoryList,setHistoryList]=useState<sessionDetail[]>([]);
    const [loading,setLoading]=useState(false);
    

    useEffect(()=>{
      GetHistoryList();
    },[])
    const GetHistoryList=async ()=>{
      setLoading(true);
      try {
        const result=await axios.get('/api/session-chat?sessionId=all');
        console.log(result.data)
        setHistoryList(result.data);
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false);
      }
    }
  return (
    <div>
    {loading ? 
      <div className='flex items-center justify-center p-20'>
          <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    : HistoryList.length==0?
    <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/70 p-7 text-center'>
        <Image src={'/medical-assistance.png'} alt='empty' width={150} height={150} />
        <h2 className='font-bold text-xl mt-2'>No Recent Consultations</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">It looks like you haven’t had a consultation yet. Start whenever you’re ready.</p>
        <AddNewSessionDialog/>
    </div>
    : <div>
      <HistoryTable HistoryList={HistoryList}/>
    </div>

    }
    </div>
  )
}

export default HistoryList
