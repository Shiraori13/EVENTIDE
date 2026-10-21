import { spawnSync } from 'node:child_process';
const protocol=['--root=artifacts/next-beta','--warmup=5','--seconds=30','--repeats=1','--pinned=1','--quiet=1'];
// Tuần tự, chỉ chạy khi các browser/test/rendered-run khác đã dừng; AB rồi đảo BA.
for(const[label,port,scenarios,quality,motion]of [
 ['before-final',4300,'light,dense,endgame,duo','medium','full'],
 ['after-final',4301,'light,dense,endgame,duo','medium','full'],
 ['after-reverse',4301,'dense,duo','medium','full'],
 ['before-reverse',4300,'dense,duo','medium','full'],
 ['duo-low',4301,'duo','low','full'],
 ['duo-reduced',4301,'duo','medium','reduce'],
]){
 const result=spawnSync(process.execPath,['scripts/performance/benchmark.mjs',...protocol,`--label=${label}`,`--url=http://127.0.0.1:${port}/EVENTIDE`,`--scenarios=${scenarios}`,`--quality=${quality}`,`--motion=${motion}`],{stdio:'inherit',windowsHide:true});
 if(result.status!==0)process.exit(result.status??1);
}
