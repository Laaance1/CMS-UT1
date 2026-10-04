// No CMS HTML is trusted. Only exact HTTPS hosts and valid video identifiers pass.
export function youtubeId(input:string|null|undefined):string|null {
  if(!input) return null;
  try {
    const url=new URL(input);
    if(url.protocol!=='https:'||url.username||url.password||url.port) return null;
    let id:string|null=null;
    if(url.hostname==='youtu.be'&&/^\/[\w-]+\/?$/.test(url.pathname)) id=url.pathname.split('/')[1];
    if(['youtube.com','www.youtube.com','m.youtube.com'].includes(url.hostname)) {
      if(url.pathname==='/watch') id=url.searchParams.get('v');
      else if(/^\/(embed|shorts)\/[\w-]+\/?$/.test(url.pathname)) id=url.pathname.split('/')[2];
    }
    return id&&/^[A-Za-z0-9_-]{11}$/.test(id)?id:null;
  }catch{return null;}
}
