import type {Person} from './domain';
export const days=['Po 16. 11.','Út 17. 11.','St 18. 11.','Čt 19. 11.','Pá 20. 11.','So 21. 11.','Ne 22. 11.'];
const sh=(id:string,day:number,start:number,end:number,role:string,place:'front'|'warehouse',draft=false)=>({id,day,start,end,role,status:draft?'draft' as const:'published' as const,segments:[{start,end,place}]});
export const people:Person[]=[
 {id:'1',name:'Tereza Novotná',initials:'TN',role:'STL',mode:'Krátký / dlouhý týden',expected:40,shifts:[sh('a',0,8,20,'STL','front'),sh('b',1,8,20,'STL','front'),sh('c',4,8,20,'STL','front')]},
 {id:'2',name:'David Procházka',initials:'DP',role:'TL',mode:'Po–Pá',expected:40,shifts:[0,1,2,3,4].map(d=>sh('d'+d,d,9,17,'TL','front'))},
 {id:'3',name:'Klára Jelínková',initials:'KJ',role:'SS',mode:'Po–Pá',expected:40,shifts:[0,1,2,3,4].map(d=>sh('k'+d,d,8.5,16.5,'SS','front',d===4))},
 {id:'4',name:'Matěj Svoboda',initials:'MS',role:'BRIGÁDNÍK',mode:'Nepravidelný',expected:24,shifts:[{...sh('m',2,10,18,'BRIGÁDNÍK','warehouse'),segments:[{start:10,end:13,place:'warehouse'},{start:13,end:13.5,place:'break'},{start:13.5,end:18,place:'front'}]}]},
 {id:'5',name:'Petra Horáková',initials:'PH',role:'VS',mode:'Po–Pá',expected:40,shifts:[0,1,2,3,4].map(d=>sh('p'+d,d,7,15,'VS','warehouse'))},
 {id:'6',name:'Adam Černý',initials:'AČ',role:'SKLAD',mode:'Po–Pá',expected:40,shifts:[0,1,2,3,4].map(d=>sh('z'+d,d,8,16,'SKLAD','warehouse'))},
];
