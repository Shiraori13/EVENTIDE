import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const root='artifacts/next-beta';
const suite=JSON.parse(readFileSync(`${root}/e2e-suite-observation.json`,'utf8')),rerun=JSON.parse(readFileSync(`${root}/e2e-rerun.json`,'utf8'));
function cases(suites){return suites.flatMap(s=>[...(s.specs??[]).flatMap(spec=>spec.tests.map(test=>({key:[spec.file??s.file,spec.title,test.projectName??''].join(' | '),title:spec.title,status:test.results.at(-1)?.status,expected:test.expectedStatus}))),...cases(s.suites??[])]);}
const retry=cases(rerun.suites),remaining=suite.failedTitles.filter(title=>!retry.some(r=>r.title===title&&r.status===r.expected));
assert.equal(suite.stats.expected+suite.stats.unexpected,66);assert.equal(remaining.length,0);assert.ok(retry.every(r=>r.status===r.expected));
// Lượt đầy đủ lấy từ output terminal thật; không tạo JSON Playwright giả cho log đã bị ghi đè.
const summary={method:'Lượt66case: output terminal63pass/3failed và trace ba assertion cũ còn; JSON đầy đủ bị reporter ghi đè do path theo configDir. Rerun giữ JSON Playwright nguyên gốc. Cập nhật assertion layout rồi chạy lại đúng ba case, cùng app bundle. Không gọi đây là một lượt66pass sạch.',suiteStats:suite.stats,suiteEvidence:suite.evidence,rerunStats:rerun.stats,verifiedCount:suite.stats.expected+retry.length,unresolved:remaining,rerunCases:retry};
writeFileSync(`${root}/e2e-verification.json`,JSON.stringify(summary,null,2));process.stdout.write(JSON.stringify(summary,null,2)+'\n');
