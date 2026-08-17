
'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CIPHER_REGISTRY } from '@/lib/cipher/registry'
import { checkCompatibility, type PipelineDataType, type PipelineStage } from '@/lib/pipeline/pipelineTypes'
import { createPipelineStage, executePipeline, exportPipelineToJson, importPipelineFromJson } from '@/lib/pipeline/pipelineEngine'
import { Plus, Trash2, ArrowDown, ArrowUp, Play, Square, Copy, Upload, Download, AlertTriangle, CheckCircle2 } from 'lucide-react'

const typeLabels: Record<PipelineDataType,string> = {'utf8-text':'UTF-8 text','hex-string':'Hex string','base64-string':'Base64 string','raw-bytes':'Raw bytes'}
const categoryOrder = ['classical','symmetric','asymmetric','hash'] as const

export default function CipherPipelineBuilder() {
  const [inputText,setInputText] = useState('CryptoViz Secure Message 2026')
  const [stages,setStages] = useState<PipelineStage[]>(() => [createPipelineStage('base64-encode',0)])
  const [result,setResult] = useState<Awaited<ReturnType<typeof executePipeline>> | null>(null)
  const [running,setRunning] = useState(false)
  const [paletteFilter,setPaletteFilter] = useState('')
  const controllerRef = useRef<AbortController | null>(null)
  useEffect(() => () => controllerRef.current?.abort(), [])
  const compatibility = useMemo(() => stages.slice(1).map((stage,i) => ({stage, check:checkCompatibility(stages[i].outputType,stage.inputType)})), [stages])

  const addStage=(id:string)=>setStages(s=>[...s,createPipelineStage(id,s.length)])
  const removeStage=(id:string)=>setStages(s=>s.filter(x=>x.id!==id))
  const moveStage=(index:number,delta:number)=>setStages(s=>{const copy=[...s];const target=index+delta;if(target<0||target>=copy.length)return s;[copy[index],copy[target]]=[copy[target],copy[index]];return copy})
  const updateParam=(id:string,key:string,value:string)=>setStages(s=>s.map(x=>x.id===id?{...x,params:{...x.params,[key]:value}}:x))
  const run=async()=>{controllerRef.current?.abort();const controller=new AbortController();controllerRef.current=controller;setRunning(true);setResult(null);try{setResult(await executePipeline(inputText,stages,controller.signal))}finally{setRunning(false)}}
  const stop=()=>controllerRef.current?.abort()
  const filtered=CIPHER_REGISTRY.filter(c=>c.id!=='bloom-filter' && (!paletteFilter || `${c.name} ${c.id}`.toLowerCase().includes(paletteFilter.toLowerCase())))
  const exportJson=()=>navigator.clipboard.writeText(exportPipelineToJson(stages))
  const importJson=()=>{const text=prompt('Paste exported pipeline JSON');if(text)setStages(importPipelineFromJson(text))}
  return <div className="space-y-6">
    <section className="rounded-3xl border border-zinc-200 bg-gradient-to-br from-purple-500/10 via-teal-500/5 to-transparent p-8 dark:border-zinc-800">
      <h1 className="text-3xl font-black text-zinc-950 dark:text-white">Cipher <span className="text-purple-500">Pipeline Builder</span></h1>
      <p className="mt-2 max-w-3xl text-sm text-zinc-500">Build asynchronous pipelines from the complete cipher registry, validate representation boundaries, and inspect every intermediate result.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={run} disabled={running||!stages.length} className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-50"><Play className="mr-1 inline h-4 w-4"/>Run pipeline</button>
        <button onClick={stop} disabled={!running} className="rounded-xl border px-4 py-2 text-xs font-bold disabled:opacity-50"><Square className="mr-1 inline h-4 w-4"/>Cancel</button>
        <button onClick={exportJson} className="rounded-xl border px-4 py-2 text-xs font-bold"><Copy className="mr-1 inline h-4 w-4"/>Export JSON</button>
        <button onClick={importJson} className="rounded-xl border px-4 py-2 text-xs font-bold"><Upload className="mr-1 inline h-4 w-4"/>Import JSON</button>
      </div>
    </section>
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Initial pipeline payload</label>
      <textarea value={inputText} onChange={e=>setInputText(e.target.value)} rows={3} className="mt-2 w-full rounded-xl border bg-zinc-50 p-3 font-mono text-sm dark:border-zinc-800 dark:bg-zinc-950"/>
    </section>
    <div className="grid gap-6 lg:grid-cols-3">
      <section className="space-y-3 lg:col-span-2">
        {stages.map((stage,index)=>{const exec=result?.stageResults.find(r=>r.stageId===stage.id);return <article key={stage.id} className="rounded-2xl border bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <header className="flex items-center justify-between"><div><span className="mr-2 rounded-full bg-purple-500/10 px-2 py-1 text-[10px] font-bold text-purple-600">STAGE {index+1}</span><b className="text-sm">{stage.name}</b></div><div className="flex gap-1"><button onClick={()=>moveStage(index,-1)} disabled={index===0}><ArrowUp className="h-4 w-4"/></button><button onClick={()=>moveStage(index,1)} disabled={index===stages.length-1}><ArrowDown className="h-4 w-4"/></button><button onClick={()=>removeStage(stage.id)}><Trash2 className="h-4 w-4 text-red-500"/></button></div></header>
          <div className="mt-3 flex flex-wrap gap-2 text-[10px]"><span className="rounded-full bg-zinc-100 px-2 py-1 dark:bg-zinc-800">input: {typeLabels[stage.inputType]}</span><span>→</span><span className="rounded-full bg-zinc-100 px-2 py-1 dark:bg-zinc-800">output: {typeLabels[stage.outputType]}</span></div>
          {CIPHER_REGISTRY.find(c=>c.id===stage.cipherId)?.options?.map(option=><label key={option.id} className="mt-3 mr-3 inline-flex items-center gap-2 text-xs"><span>{option.name}</span><input value={stage.params[option.id]??''} onChange={e=>updateParam(stage.id,option.id,e.target.value)} className="w-28 rounded border px-2 py-1 dark:border-zinc-700 dark:bg-zinc-950"/></label>)}
          {exec&&<div className="mt-4 rounded-xl bg-zinc-950 p-3 text-xs text-zinc-200"><div className="flex justify-between text-[10px] text-zinc-400"><span>Intermediate output</span><span>{exec.durationMs.toFixed(2)} ms</span></div><div className="mt-2 break-all font-mono">{exec.error||exec.output}</div>{exec.steps.length>0&&<div className="mt-2 text-zinc-400">{exec.steps.length} trace steps captured</div>}</div>}
        </article>})}
        {compatibility.map(({stage,check})=>!check.compatible&&<div key={stage.id} className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-200"><AlertTriangle className="mr-2 inline h-4 w-4"/>{check.message} {check.adapter&&<button className="ml-2 underline font-bold" onClick={()=>{const i=stages.findIndex(s=>s.id===stage.id);const adapter=createPipelineStage(check.adapter!,i);setStages(s=>[...s.slice(0,i),adapter,...s.slice(i)])}}>Insert {check.adapter}</button>}</div>)}
      </section>
      <aside className="rounded-2xl border bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-bold uppercase tracking-wider">Registry palette</h2>
        <input value={paletteFilter} onChange={e=>setPaletteFilter(e.target.value)} placeholder="Search 100+ registered algorithms" className="mt-3 w-full rounded-xl border px-3 py-2 text-xs dark:border-zinc-700 dark:bg-zinc-950"/>
        <div className="mt-3 max-h-[620px] space-y-2 overflow-y-auto">{categoryOrder.map(category=>{const items=filtered.filter(c=>c.category===category);return <div key={category}><h3 className="mt-3 mb-2 text-[10px] font-bold uppercase text-zinc-400">{category}</h3>{items.map(cipher=><button key={cipher.id} onClick={()=>addStage(cipher.id)} className="flex w-full items-center justify-between rounded-lg border p-2 text-left text-xs hover:border-purple-400 dark:border-zinc-800"><span>{cipher.name}</span><Plus className="h-3.5 w-3.5 text-purple-500"/></button>)}</div>})}</div>
      </aside>
    </div>
    {result&&<section className="rounded-2xl border border-purple-500/30 bg-purple-500/5 p-5"><div className="flex items-center gap-2 text-xs font-bold uppercase text-purple-600">{result.success?<CheckCircle2 className="h-4 w-4"/>:<AlertTriangle className="h-4 w-4"/>}{result.cancelled?'Pipeline cancelled':result.success?'Pipeline completed':'Pipeline failed'} · {result.totalDurationMs.toFixed(2)} ms</div><pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap break-all rounded-xl bg-white p-3 font-mono text-xs dark:bg-zinc-950">{result.finalOutput}</pre></section>}
  </div>
}
