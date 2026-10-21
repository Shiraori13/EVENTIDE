import { spawnSync } from 'node:child_process';
const protocol=['--root=artifacts/multiboss','--quality=medium','--warmup=5','--seconds=30','--repeats=1','--pinned=1','--scenarios=dense,endgame'];
// Đảo thứ tự so với lượt đầu để giữ cả chênh lệch giữa lượt, không chọn mẫu đẹp.
for(const[label,url]of[['after-control','http://127.0.0.1:4201/EVENTIDE/'],['before-control','http://127.0.0.1:4200/EVENTIDE/']]){
 const r=spawnSync(process.execPath,['scripts/performance/benchmark.mjs',...protocol,`--label=${label}`,`--url=${url}`],{stdio:'inherit',windowsHide:true});if(r.status!==0)process.exit(r.status??1);
}
