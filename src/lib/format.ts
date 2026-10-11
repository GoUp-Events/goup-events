export const money=(value:number)=>value===0?'Gratuito':new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(value);
export function localDate(value:string) { const [year,month,day]=value.split('-').map(Number); return new Date(year,month-1,day); }
export const dateLabel=(value:string,long=false)=>new Intl.DateTimeFormat('pt-BR',long?{day:'numeric',month:'long',year:'numeric',weekday:'long'}:{day:'numeric',month:'short',weekday:'short'}).format(localDate(value));
export const ageLabels:Record<string,string>={FREE:'Livre',TEN:'10 anos',TWELVE:'12 anos',FOURTEEN:'14 anos',SIXTEEN:'16 anos',EIGHTEEN:'18 anos'};
export const priceLabels:Record<string,string>={FREE:'Grátis',INEXPENSIVE:'$',MODERATE:'$$',EXPENSIVE:'$$$',VERY_EXPENSIVE:'$$$$'};
export const canManage=(event:{user:{id:number}},user:{id:number;role:string}|null)=>!!user&&(event.user.id===user.id||user.role==='ADMIN');
export const citiesFrom=(events:{location:{city:string}}[])=>[...new Set(events.map(e=>e.location?.city).filter(Boolean))].sort((a,b)=>a==='Blumenau'?-1:b==='Blumenau'?1:a.localeCompare(b));
export const metadata=(title:string,description:string)=>({meta:[{title:`${title} | GoUp Events`},{name:'description',content:description},{property:'og:title',content:`${title} | GoUp Events`},{property:'og:description',content:description},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]});
