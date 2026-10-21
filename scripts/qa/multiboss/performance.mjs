import { spawnSync } from 'node:child_process';
const protocol=['--root=artifacts/multiboss','--quality=medium','--warmup=5','--seconds=30','--repeats=1','--pinned=1'];
// Tuần tự, không chạy cùng test/browser khác; baseline frozen và bản cuối cùng máy/protocol.
for(const[label,url,scenarios]of[['before-final','http://127.0.0.1:4200/EVENTIDE/','dense,endgame'],['after-final','http://127.0.0.1:4201/EVENTIDE/','dense,endgame'],['duo-final','http://127.0.0.1:4201/EVENTIDE/','duo']]){
 const result=spawnSync(process.execPath,['scripts/performance/benchmark.mjs',...protocol,`--label=${label}`,`--url=${url}`,`--scenarios=${scenarios}`],{stdio:'inherit',windowsHide:true});
 if(result.status!==0)process.exit(result.status??1);
}
