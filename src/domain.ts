export type Workplace='front'|'warehouse'|'break';
export type Segment={start:number;end:number;place:Workplace};
export type Shift={id:string;day:number;start:number;end:number;status:'draft'|'published';role:string;segments:Segment[]};
export type Person={id:string;name:string;initials:string;role:string;mode:string;expected:number;shifts:Shift[]};
export function hours(s:Shift){return Math.round(s.segments.filter(x=>x.place!=='break').reduce((n,x)=>n+x.end-x.start,0)*10)/10}
export function overlaps(a:Shift,b:Shift){return a.day===b.day&&a.start<b.end&&b.start<a.end}
export function validateSegments(s:Shift){return s.segments.every((x,i)=>x.start>=s.start&&x.end<=s.end&&x.start<x.end&&(i===0||s.segments[i-1].end<=x.start))}
export function longShortWeek(week:number,startWeek=0){const long=(week-startWeek)%2===0;return long?[0,1,4,5,6]:[2,3]}
export function coverage(people:Person[],day:number,hour:number,place:Workplace){return people.filter(p=>p.shifts.some(s=>s.status==='published'&&s.day===day&&s.segments.some(g=>g.place===place&&g.start<=hour&&g.end>hour))).length}
