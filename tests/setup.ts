import { mkdirSync } from 'node:fs';
// Checkout sạch không mang theo output local; mỗi suite có thể ghi bằng chứng vào các thư mục này.
for (const version of ['vnext','v12','v13','v14','v141']) mkdirSync(`artifacts/${version}`,{recursive:true});
