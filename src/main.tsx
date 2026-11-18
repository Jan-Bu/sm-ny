import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  CalendarDays,
  LayoutDashboard,
  Users,
  Clock3,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Sun,
  Moon,
  AlertTriangle,
  Warehouse,
  Store,
  PanelLeftClose,
  Table2,
  MousePointer2,
  GripVertical,
} from "lucide-react";
import { days, people as initial } from "./data";
import { coverage, hours, type Person, type Shift } from "./domain";
import "./style.css";
import "./features.css";
import "./fixes.css";
const nav = [
  ["Přehled", LayoutDashboard],
  ["Rozpis směn", CalendarDays],
  ["Plánování směn", Table2],
  ["Dnes", Clock3],
  ["Zaměstnanci", Users],
  ["Upozornění", Bell],
  ["Nastavení", Settings],
] as const;
function ShiftBlock({ s, onClick }: { s: Shift; onClick: () => void }) {
  return (
    <button
      className={`shift shift-role-${s.role.toLowerCase()} ${s.status === "draft" ? "draft" : ""}`}
      style={{
        left: `${((s.start - 6) / 16) * 100}%`,
        width: `${((s.end - s.start) / 16) * 100}%`,
      }}
      onClick={onClick}
    >
      {s.segments.map((g, i) => (
        <span
          key={i}
          className={"seg " + g.place}
          style={{ flex: g.end - g.start }}
        >
          <b>
            {g.start % 1
              ? String(g.start).replace(".5", ":30")
              : `${g.start}:00`}
            –{g.end % 1 ? String(g.end).replace(".5", ":30") : `${g.end}:00`}
          </b>
          <small>
            {g.place === "front"
              ? "Prodejna"
              : g.place === "warehouse"
                ? "Sklad"
                : "Přestávka"}
          </small>
        </span>
      ))}
    </button>
  );
}
function App() {
  const [view, setView] = useState("Rozpis směn"),
    [dark, setDark] = useState(false),
    [selected, setSelected] = useState<Shift | null>(null),
    [people, setPeople] = useState<Person[]>(initial),
    [toast, setToast] = useState(""),
    [mobileMenu, setMobileMenu] = useState(false);
  const publish = () => {
    setPeople((p) =>
      p.map((x) => ({
        ...x,
        shifts: x.shifts.map((s) => ({ ...s, status: "published" })),
      })),
    );
    setToast("Změny byly zveřejněny zaměstnancům.");
    setTimeout(() => setToast(""), 3000);
  };
  const updateExpectedHours = (person: Person) => {
    const value = window.prompt(
      `Nastavte týdenní fond hodin pro ${person.name}:`,
      String(person.expected),
    );
    if (value === null) return;
    const expected = Number(value.replace(",", "."));
    if (!Number.isFinite(expected) || expected < 0 || expected > 80) {
      setToast("Zadejte počet hodin od 0 do 80.");
      return;
    }
    setPeople((current) =>
      current.map((item) =>
        item.id === person.id ? { ...item, expected } : item,
      ),
    );
    setToast(`Fond zaměstnance ${person.name} byl změněn na ${expected} h.`);
  };
  return (
    <div className={dark ? "app dark" : "app"}>
      <aside className={mobileMenu ? "mobile-menu-open" : ""}>
        <div className="brand">
          <span>S</span>
          <strong>Směny</strong>
        </div>
        <div className="branch">
          <small>POBOČKA</small>
          <b>Chrášťany</b>
        </div>
        <nav>
          {nav.map(([n, I]) => (
            <button
              key={n}
              className={view === n ? "active" : ""}
              onClick={() => { setView(n); setMobileMenu(false); }}
            >
              <I size={19} />
              {n}
              {n === "Upozornění" && <em>4</em>}
            </button>
          ))}
        </nav>
        <div className="user">
          <span>JN</span>
          <div>
            <b>Jan Novák</b>
            <small>Hlavní správce</small>
          </div>
        </div>
      </aside>
      <main>
        <header>
          <button className="icon mobile" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Otevřít hlavní nabídku" aria-expanded={mobileMenu}>
            <PanelLeftClose />
          </button>
          <div>
            <h1>{view}</h1>
            <p>Středa 18. listopadu 2026 · 14:32</p>
          </div>
          <div className="actions">
            <button
              className="icon"
              aria-label="Změnit motiv"
              onClick={() => setDark(!dark)}
            >
              {dark ? <Sun /> : <Moon />}
            </button>
            <button className="icon">
              <Bell />
              <i />
            </button>
            <button
              className="primary"
              onClick={() => setToast("Editor nové směny je připraven.")}
            >
              <Plus /> Nová směna
            </button>
          </div>
        </header>
        {view === "Rozpis směn" && (
          <Schedule
            people={people}
            onSelect={setSelected}
            publish={publish}
            onUpdateExpected={updateExpectedHours}
          />
        )}
        {view === "Plánování směn" && (
          <ShiftPlanning
            people={people}
            setPeople={setPeople}
            notify={setToast}
          />
        )}
        {view === "Přehled" && <Dashboard people={people} setView={setView} />}
        {view === "Dnes" && <Today people={people} onSelect={setSelected} />}
        {view === "Zaměstnanci" && <Employees people={people} />}
        {view === "Upozornění" && <Notifications />}
        {view === "Nastavení" && <SettingsView />}
      </main>
      {mobileMenu && <button className="mobile-menu-backdrop" aria-label="Zavřít nabídku" onClick={() => setMobileMenu(false)}/>} 
      {selected && (
        <div className="overlay" onMouseDown={() => setSelected(null)}>
          <section className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setSelected(null)}>
              ×
            </button>
            <small>DETAIL SMĚNY</small>
            <h2>
              {selected.role} · {days[selected.day]}
            </h2>
            <p className="big">
              {selected.start}:00–{selected.end}:00
            </p>
            <div className="segments">
              {selected.segments.map((g, i) => (
                <div key={i}>
                  <span className={g.place} />
                  <b>
                    {g.start}–{g.end}
                  </b>{" "}
                  {g.place === "front"
                    ? "Prodejna / předek"
                    : g.place === "warehouse"
                      ? "Sklad / zázemí"
                      : "Přestávka"}
                </div>
              ))}
            </div>
            <label>
              Poznámka
              <textarea placeholder="Poznámka pro zaměstnance…" />
            </label>
            <div className="modalactions">
              <button onClick={() => setSelected(null)}>Zavřít</button>
              <button
                className="primary"
                onClick={() => {
                  setToast("Směna byla uložena.");
                  setSelected(null);
                }}
              >
                Uložit změny
              </button>
            </div>
          </section>
        </div>
      )}
      {toast && <div className="toast">✓ {toast}</div>}
    </div>
  );
}
type ScheduleRange = "day" | "week" | "fortnight" | "month";
type ScheduleDate = { key: string; label: string; shiftDay: number; isToday: boolean };

function buildScheduleDates(anchorValue: string, range: ScheduleRange): ScheduleDate[] {
  const anchor = new Date(`${anchorValue}T12:00:00`);
  const start = new Date(anchor);
  if (range === "week" || range === "fortnight") {
    const weekday = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - weekday);
  } else if (range === "month") start.setDate(1);
  const count = range === "day" ? 1 : range === "week" ? 7 : range === "fortnight" ? 14 : new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
  const base = new Date("2026-11-16T12:00:00");
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(start); date.setDate(start.getDate() + index);
    const shiftDay = Math.round((date.getTime() - base.getTime()) / 86_400_000);
    return { key: date.toISOString().slice(0,10), label: new Intl.DateTimeFormat("cs-CZ",{weekday:"short",day:"numeric",month:"numeric"}).format(date), shiftDay, isToday: date.toISOString().slice(0,10) === "2026-11-18" };
  });
}

function Schedule({
  people,
  onSelect,
  publish,
  onUpdateExpected,
}: {
  people: Person[];
  onSelect: (s: Shift) => void;
  publish: () => void;
  onUpdateExpected: (person: Person) => void;
}) {
  const [showAvailable, setShowAvailable] = useState(false);
  const [range, setRange] = useState<ScheduleRange>("week");
  const [anchor, setAnchor] = useState("2026-11-18");
  const scheduleDays = buildScheduleDates(anchor, range);
  const visibleShiftDays = new Set(scheduleDays.map((date) => date.shiftDay));
  const hasWorkplace = (person: Person, workplace: "front" | "warehouse") =>
    person.shifts.some(
      (shift) =>
        visibleShiftDays.has(shift.day) &&
        shift.segments.some((segment) => segment.place === workplace),
    );
  const frontPeople = people.filter((person) =>
    person.role === "BRIGÁDNÍK"
      ? hasWorkplace(person, "front")
      : person.role !== "SKLAD" && person.role !== "VS" && hasWorkplace(person, "front"),
  );
  const warehousePeople = people.filter((person) =>
    person.role === "BRIGÁDNÍK"
      ? hasWorkplace(person, "warehouse")
      : (person.role === "SKLAD" || person.role === "VS") && hasWorkplace(person, "warehouse"),
  );
  const availablePeople = people
    .filter((person) => !person.shifts.some((shift) => visibleShiftDays.has(shift.day)))
    .sort((a,b) => ["STL","VS","TL","SS","SKLAD","BRIGÁDNÍK"].indexOf(a.role) - ["STL","VS","TL","SS","SKLAD","BRIGÁDNÍK"].indexOf(b.role));
  const gridStyle = { gridTemplateColumns: `250px repeat(${scheduleDays.length}, minmax(${range === "month" ? 74 : range === "fortnight" ? 105 : range === "day" ? 520 : 150}px, 1fr))` };
  const moveRange = (direction:number) => { const date=new Date(`${anchor}T12:00:00`);date.setDate(date.getDate()+direction*(range==="day"?1:range==="week"?7:range==="fortnight"?14:30));setAnchor(date.toISOString().slice(0,10)); };
  return (
    <>
      <section className="toolbar">
        <div className="week">
          <button onClick={() => moveRange(-1)} aria-label="Předchozí období">
            <ChevronLeft />
          </button>
          <label className="date-picker"><CalendarDays/><input type="date" value={anchor} onChange={(event) => setAnchor(event.target.value)}/></label>
          <button onClick={() => moveRange(1)} aria-label="Následující období">
            <ChevronRight />
          </button>
          <button onClick={() => setAnchor("2026-11-18")}>Dnes</button>
          <div className="range-tabs">
            {(["day","week","fortnight","month"] as const).map((item) => <button key={item} className={range===item?"active":""} onClick={() => setRange(item)}>{item==="day"?"Den":item==="week"?"Týden":item==="fortnight"?"14 dní":"Měsíc"}</button>)}
          </div>
        </div>
        <div>
          <label className="search">
            <Search />
            <input placeholder="Hledat zaměstnance" />
          </label>
          <button
            className={showAvailable ? "timeoff-toggle active" : "timeoff-toggle"}
            onClick={() => setShowAvailable((value) => !value)}
            aria-pressed={showAvailable}
          >
            <Users /> {showAvailable ? "Skrýt dostupné" : "Zobrazit dostupné zaměstnance"}
          </button>
          <button className="publish" onClick={publish}>
            Zveřejnit změny <span>1</span>
          </button>
        </div>
      </section>
      <section className="metrics">
        <div>
          <Store />
          <span>
            <small>PRODEJNA NYNÍ</small>
            <b>5 lidí</b>
          </span>
          <em className="ok">Obsazeno</em>
        </div>
        <div>
          <Warehouse />
          <span>
            <small>SKLAD NYNÍ</small>
            <b>2 lidé</b>
          </span>
          <em className="warn">Minimum</em>
        </div>
        <div>
          <AlertTriangle />
          <span>
            <small>KONTROLA TÝDNE</small>
            <b>3 upozornění</b>
          </span>
          <em>Zkontrolovat</em>
        </div>
      </section>
      {showAvailable && <AvailableEmployees people={availablePeople}/>} 
      <section className={`schedule schedule-${range}`}>
        <div className="gridhead" style={gridStyle}>
          <div className="employee">ZAMĚSTNANEC</div>
          {scheduleDays.map((date) => (
            <div key={date.key} className={date.isToday ? "today" : ""}>
              {date.label}
              <small>
                {coverage(people, date.shiftDay, 14, "front")} předek ·{" "}
                {coverage(people, date.shiftDay, 14, "warehouse")} sklad
              </small>
            </div>
          ))}
        </div>
        <Group
          title="PRODEJNA / PŘEDEK"
          people={frontPeople}
          workplace="front"
          onSelect={onSelect}
          onUpdateExpected={onUpdateExpected}
          scheduleDays={scheduleDays}
          gridStyle={gridStyle}
        />
        <Group
          title="SKLAD / ZÁZEMÍ"
          people={warehousePeople}
          workplace="warehouse"
          onSelect={onSelect}
          onUpdateExpected={onUpdateExpected}
          scheduleDays={scheduleDays}
          gridStyle={gridStyle}
        />
        <Coverage people={people} scheduleDays={scheduleDays} gridStyle={gridStyle}/>
      </section>
    </>
  );
}
function Group({
  title,
  people,
  onSelect,
  onUpdateExpected,
  scheduleDays,
  gridStyle,
  workplace,
}: {
  title: string;
  people: Person[];
  onSelect: (s: Shift) => void;
  onUpdateExpected: (person: Person) => void;
  scheduleDays: ScheduleDate[];
  gridStyle: React.CSSProperties;
  workplace: "front" | "warehouse";
}) {
  if (people.length === 0) return null;
  return (
    <div>
      <div className="group">
        <b>⌄ {title}</b>
        <span>{people.length} zaměstnanci</span>
      </div>
      {people.map((p) => (
        <div className="row" key={p.id} style={gridStyle}>
          <div className="employee person">
            <span>{p.initials}</span>
            <div>
              <b>{p.name}</b>
              <small>
                <mark className={`role-badge role-${p.role.toLowerCase()}`}>
                  {p.role}
                </mark>{" "}
                <span
                  className={`employment-type employment-${p.mode === "Po–Pá" ? "standard" : p.mode.includes("Krátký") ? "cycle" : "parttime"}`}
                >
                  {p.mode}
                </span>
              </small>
            </div>
            <button
              className="hours-editor"
              onClick={() => onUpdateExpected(p)}
              title="Upravit týdenní fond hodin"
            >
              {p.shifts.reduce((n, s) => n + hours(s), 0)} / {p.expected} h
            </button>
          </div>
          {scheduleDays.map((date) => (
            <div className="cell" key={date.key}>
              {p.shifts
                .filter((s) => s.day === date.shiftDay && s.segments.some((segment) => segment.place === workplace))
                .map((s) => {
                  const segments = s.segments.filter((segment) => segment.place === workplace);
                  const workplaceShift = {...s,start:Math.min(...segments.map((segment) => segment.start)),end:Math.max(...segments.map((segment) => segment.end)),segments};
                  return <ShiftBlock key={`${s.id}-${workplace}`} s={workplaceShift} onClick={() => onSelect(s)} />;
                })}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function AvailableEmployees({ people }: { people: Person[] }) {
  const hierarchy = ["STL", "VS", "TL", "SS", "SKLAD", "BRIGÁDNÍK"];
  return (
    <section className="available-employees">
      <div className="available-heading">
        <div><Users/><span><b>Dostupní zaměstnanci</b><small>Bez naplánované směny v celém zvoleném období</small></span></div>
        <strong>{people.length}</strong>
      </div>
      {people.length === 0 ? <p className="available-empty">Všichni zaměstnanci mají ve zvoleném období alespoň jednu směnu.</p> : <div className="available-groups">{hierarchy.map((role) => {
        const members = people.filter((person) => person.role === role);
        if (!members.length) return null;
        return <div className={`available-role available-role-${role.toLowerCase()}`} key={role}><header><RoleBadge role={role}/><span>{members.length}</span></header>{members.map((person) => <div className="available-person" key={person.id}><span className="avatar">{person.initials}</span><div><b>{person.name}</b><small>{person.mode} · fond {person.expected} h</small></div></div>)}</div>;
      })}</div>}
    </section>
  );
}
function Coverage({ people, scheduleDays, gridStyle }: { people: Person[]; scheduleDays:ScheduleDate[]; gridStyle:React.CSSProperties }) {
  const timeline = [6, 8, 10, 12, 14, 16, 18, 20];
  const totalWeekHours = people.reduce(
    (total, person) =>
      total + person.shifts.filter((shift) => scheduleDays.some((date) => date.shiftDay === shift.day)).reduce((sum, shift) => sum + hours(shift), 0),
    0,
  );
  return (
    <div className="coverage coverage-day" style={gridStyle}>
      <div>
        <b>Obsazenost během dne</b>
        <small>6:00–22:00 · kontrola minim</small>
        <strong>{totalWeekHours} h</strong>
        <small>celá pobočka za zvolené období</small>
      </div>
      {scheduleDays.map((date) => {
        const dayHours = people.reduce(
          (total, person) =>
            total +
            person.shifts
              .filter((shift) => shift.day === date.shiftDay)
              .reduce((sum, shift) => sum + hours(shift), 0),
          0,
        );
        return (
          <div className="day-coverage" key={date.key}>
            <div className="coverage-bars">
              {timeline.map((hour) => {
                const front = coverage(people, date.shiftDay, hour, "front");
                const warehouse = coverage(people, date.shiftDay, hour, "warehouse");
                return (
                  <span className="coverage-hour" key={hour} title={`${hour}:00 · prodejna ${front}, sklad ${warehouse}`}>
                    <i className={front < 2 ? "front low" : "front"} style={{ height: `${Math.max(4, front * 7)}px` }} />
                    <i className={warehouse < 1 ? "warehouse low" : "warehouse"} style={{ height: `${Math.max(4, warehouse * 7)}px` }} />
                    <small>{hour}</small>
                  </span>
                );
              })}
            </div>
            <b>{dayHours} h</b>
            <small>celkem</small>
          </div>
        );
      })}
    </div>
  );
}
function RoleBadge({ role }: { role: string }) {
  return <mark className={`role-badge role-${role.toLowerCase()}`}>{role}</mark>;
}

function Dashboard({
  people,
  setView,
}: {
  people: Person[];
  setView: (view: string) => void;
}) {
  const today = 2;
  const working = people.filter((p) => p.shifts.some((s) => s.day === today));
  const totalHours = people.reduce(
    (total, person) => total + person.shifts.reduce((sum, shift) => sum + hours(shift), 0),
    0,
  );
  return (
    <div className="page-content">
      <section className="summary-grid">
        <article><small>DNES VE SMĚNĚ</small><strong>{working.length}</strong><span>z {people.length} zaměstnanců</span></article>
        <article><small>NAPLÁNOVÁNO</small><strong>{totalHours} h</strong><span>v aktuálním týdnu</span></article>
        <article className="alert-card"><small>PROVOZNÍ KONTROLA</small><strong>3</strong><span>upozornění k obsazení</span></article>
        <article><small>NEZVEŘEJNĚNO</small><strong>1</strong><span>změna čeká na publikaci</span></article>
      </section>
      <section className="content-grid">
        <article className="panel">
          <div className="panel-head"><div><h2>Dnešní tým</h2><p>Středa 18. listopadu</p></div><button onClick={() => setView("Dnes")}>Otevřít pohled Dnes</button></div>
          <div className="team-list">{working.map((p) => { const shift = p.shifts.find((s) => s.day === today)!; return <div key={p.id}><span className="avatar">{p.initials}</span><div><b>{p.name}</b><small>{shift.start}:00–{shift.end}:00</small></div><RoleBadge role={p.role}/><em>{shift.segments.some((s) => s.place === "warehouse") ? "Sklad / přesun" : "Prodejna"}</em></div>; })}</div>
        </article>
        <article className="panel">
          <div className="panel-head"><div><h2>Vyžaduje pozornost</h2><p>Kontroly nejsou právním posouzením</p></div></div>
          <ul className="warning-list"><li><AlertTriangle/>Sobota 10:00–18:00: chybí vedoucí</li><li><AlertTriangle/>Neděle: sklad není obsazen</li><li><Clock3/>Klára má 1 nezveřejněnou směnu</li></ul>
        </article>
      </section>
    </div>
  );
}

function Today({ people, onSelect }: { people: Person[]; onSelect: (shift: Shift) => void }) {
  const today = 2;
  const active = people.flatMap((person) => person.shifts.filter((s) => s.day === today).map((shift) => ({ person, shift })));
  const front = active.filter(({ shift }) => shift.segments.some((s) => s.place === "front"));
  const warehouse = active.filter(({ shift }) => shift.segments.some((s) => s.place === "warehouse"));
  const list = (items: typeof active) => <div className="today-list">{items.map(({person, shift}) => <button key={`${person.id}-${shift.id}`} onClick={() => onSelect(shift)}><span className="avatar">{person.initials}</span><div><b>{person.name}</b><small>{shift.start}:00–{shift.end}:00 · {person.mode}</small></div><RoleBadge role={person.role}/><em>{shift.start <= 14 && shift.end > 14 ? "Právě v práci" : "Dnes"}</em></button>)}</div>;
  return <div className="page-content"><section className="today-hero"><div><small>STŘEDA 18. LISTOPADU</small><h2>Dnes je naplánováno {active.length} lidí</h2><p>Aktuální provozní přehled pobočky Chrášťany</p></div><div><strong>{coverage(people,today,14,"front")}</strong><span>prodejna</span><strong>{coverage(people,today,14,"warehouse")}</strong><span>sklad</span></div></section><section className="content-grid"><article className="panel"><div className="panel-head"><h2><Store/> Prodejna / předek</h2><span>{front.length} lidí</span></div>{list(front)}</article><article className="panel"><div className="panel-head"><h2><Warehouse/> Sklad / zázemí</h2><span>{warehouse.length} lidé</span></div>{list(warehouse)}</article></section></div>;
}

function Employees({ people }: { people: Person[] }) {
  const [query, setQuery] = useState("");
  const filtered = people.filter((p) => `${p.name} ${p.role} ${p.mode}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="page-content"><section className="panel"><div className="panel-head"><div><h2>Zaměstnanci pobočky Chrášťany</h2><p>{people.length} aktivních účtů</p></div><label className="search"><Search/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Hledat jméno, pozici nebo režim"/></label></div><div className="employee-table"><div className="table-head"><span>Zaměstnanec</span><span>Pozice</span><span>Pracovní režim</span><span>Hodiny</span><span>Stav</span></div>{filtered.map((p) => <div key={p.id}><span className="employee-name"><i className="avatar">{p.initials}</i><b>{p.name}</b></span><span><RoleBadge role={p.role}/></span><span className={`employment-type employment-${p.mode === "Po–Pá" ? "standard" : p.mode.includes("Krátký") ? "cycle" : "parttime"}`}>{p.mode}</span><span>{p.shifts.reduce((n,s) => n + hours(s),0)} / {p.expected} h</span><span className="status-active">Aktivní</span></div>)}</div></section></div>;
}

function Notifications() {
  const [items, setItems] = useState([
    {id:1,title:"Nedostatečné obsazení skladu",body:"V neděli 22. 11. není ve skladu naplánovaný žádný zaměstnanec.",type:"warning",read:false},
    {id:2,title:"Koncept směny čeká na zveřejnění",body:"Páteční směna Kláry Jelínkové zatím není viditelná zaměstnanci.",type:"info",read:false},
    {id:3,title:"Nový účet čeká na schválení",body:"Marek Čekající dokončil registraci.",type:"account",read:false},
    {id:4,title:"Rozpis byl aktualizován",body:"Týden 16.–22. listopadu upravil Jan Novák.",type:"success",read:true},
  ]);
  return <div className="page-content"><section className="panel"><div className="panel-head"><div><h2>Centrum upozornění</h2><p>{items.filter((i) => !i.read).length} nepřečtená upozornění</p></div><button onClick={() => setItems(items.map((i) => ({...i,read:true})))}>Označit vše jako přečtené</button></div><div className="notification-list">{items.map((item) => <button className={item.read ? "read" : ""} key={item.id} onClick={() => setItems(items.map((i) => i.id === item.id ? {...i,read:true} : i))}><span className={`notification-icon ${item.type}`}>{item.type === "warning" ? "!" : item.type === "account" ? "+" : "✓"}</span><div><b>{item.title}</b><p>{item.body}</p><small>Dnes · 14:20</small></div>{!item.read && <i/>}</button>)}</div></section></div>;
}

function SettingsView() {
  const [darkSchedule, setDarkSchedule] = useState(false);
  const [emails, setEmails] = useState(true);
  const [saved, setSaved] = useState(false);
  return <div className="page-content settings-page"><section className="panel"><div className="panel-head"><div><h2>Nastavení pobočky</h2><p>Provozní a uživatelské preference</p></div></div><div className="settings-form"><label><span>Název pobočky<small>Zobrazuje se v aplikaci a exportech</small></span><input defaultValue="Chrášťany"/></label><label><span>Časové pásmo<small>Český čas včetně letního času</small></span><select defaultValue="Europe/Prague"><option>Europe/Prague</option></select></label><label className="switch-row"><span>Tmavý rozpis<small>Výchozí motiv plánovací obrazovky</small></span><button className={darkSchedule ? "switch on" : "switch"} onClick={() => setDarkSchedule(!darkSchedule)} aria-pressed={darkSchedule}><i/></button></label><label className="switch-row"><span>E-mailová upozornění<small>Publikace a změny směn</small></span><button className={emails ? "switch on" : "switch"} onClick={() => setEmails(!emails)} aria-pressed={emails}><i/></button></label><div className="settings-actions"><button className="primary" onClick={() => {setSaved(true);setTimeout(() => setSaved(false),2500)}}>Uložit nastavení</button>{saved && <span>✓ Nastavení bylo uloženo</span>}</div></div></section></div>;
}

type MonthCell = {
  value: string;
  status: "shift" | "empty" | "vacation" | "sick" | "training" | "other";
  note: string;
};

function ShiftPlanning({
  people,
  setPeople,
  notify,
}: {
  people: Person[];
  setPeople: React.Dispatch<React.SetStateAction<Person[]>>;
  notify: (message: string) => void;
}) {
  const [mode, setMode] = useState<"visual" | "table">("visual");
  return (
    <div className="planning-page page-content">
      <section className="planning-intro">
        <div>
          <small>PLÁNOVÁNÍ POBOČKY CHRÁŠŤANY</small>
          <h2>Sestavte rozpis způsobem, který vám vyhovuje</h2>
          <p>Oba režimy pracují se stejným týmem a podporují směny, dovolenou, nemoc, školení i jiné absence.</p>
        </div>
        <div className="planning-mode-tabs" role="tablist">
          <button className={mode === "visual" ? "active" : ""} onClick={() => setMode("visual")}><MousePointer2/>Vizuální plánovač<small>Přetahování karet</small></button>
          <button className={mode === "table" ? "active" : ""} onClick={() => setMode("table")}><Table2/>Měsíční tabulka<small>Editace jako v Excelu</small></button>
        </div>
      </section>
      {mode === "visual" ? <VisualPlanner people={people} setPeople={setPeople} notify={notify}/> : <MonthlyPlanner people={people} notify={notify}/>} 
    </div>
  );
}

function defaultShift(person: Person) {
  if (person.role === "STL") return { start: 8, end: 20 };
  if (person.role === "VS") return { start: 7, end: 15 };
  if (person.role === "SKLAD") return { start: 8, end: 16 };
  return { start: 9, end: 17 };
}

function readTimeRange(value: string) {
  const match = value.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*[-–]\s*(\d{1,2})(?::(\d{2}))?$/);
  if (!match) return null;
  const start = Number(match[1]) + Number(match[2] || 0) / 60;
  const end = Number(match[3]) + Number(match[4] || 0) / 60;
  return start >= 0 && end <= 24 && start < end ? { start, end } : null;
}

function VisualPlanner({people,setPeople,notify}:{people:Person[];setPeople:React.Dispatch<React.SetStateAction<Person[]>>;notify:(message:string)=>void}) {
  const assign = (personId:string, day:number) => {
    const person = people.find((item) => item.id === personId);
    if (!person || person.shifts.some((shift) => shift.day === day)) { notify("Zaměstnanec už má v tento den naplánovanou směnu."); return; }
    let time = defaultShift(person);
    if (person.role === "BRIGÁDNÍK") {
      const entered = window.prompt(`Od kolika do kolika bude ${person.name} pracovat?`, "10:00–18:00");
      if (entered === null) return;
      const parsed = readTimeRange(entered);
      if (!parsed) { notify("Použijte formát například 10:00–18:00."); return; }
      time = parsed;
    }
    const place = person.role === "SKLAD" || person.role === "VS" ? "warehouse" as const : "front" as const;
    const shift:Shift = { id:`plan-${person.id}-${day}-${Date.now()}`,day,...time,status:"draft",role:person.role,segments:[{...time,place}] };
    setPeople((current) => current.map((item) => item.id === person.id ? {...item,shifts:[...item.shifts,shift]} : item));
    notify(`${person.name} byl přiřazen na ${days[day]}.`);
  };
  const edit = (person:Person, shift:Shift) => {
    const entered = window.prompt(`Upravte čas směny pro ${person.name}:`, `${shift.start}:00–${shift.end}:00`);
    if (entered === null) return;
    const parsed = readTimeRange(entered);
    if (!parsed) { notify("Použijte formát například 8:00–16:30."); return; }
    setPeople((current) => current.map((item) => item.id !== person.id ? item : {...item,shifts:item.shifts.map((itemShift) => itemShift.id === shift.id ? {...itemShift,...parsed,segments:itemShift.segments.map((segment) => ({...segment,...parsed}))} : itemShift)}));
    notify("Čas směny byl upraven.");
  };
  return <section className="visual-planner"><aside className="employee-palette"><div><h3>Zaměstnanci</h3><p>Přetáhněte kartu na den</p></div>{people.map((person) => {const time=defaultShift(person);return <div className="drag-person" draggable onDragStart={(event) => event.dataTransfer.setData("text/person",person.id)} key={person.id}><GripVertical/><span className="avatar">{person.initials}</span><div><b>{person.name}</b><small>{person.role === "BRIGÁDNÍK" ? "Čas zadáte po vložení" : `${time.start}:00–${time.end}:00`}</small></div><RoleBadge role={person.role}/></div>})}</aside><div className="week-drop-grid">{days.map((day,index) => <div className="drop-day" key={day} onDragOver={(event) => {event.preventDefault();event.currentTarget.classList.add("drag-over")}} onDragLeave={(event) => event.currentTarget.classList.remove("drag-over")} onDrop={(event) => {event.preventDefault();event.currentTarget.classList.remove("drag-over");assign(event.dataTransfer.getData("text/person"),index)}}><header><b>{day}</b><small>{people.filter((person) => person.shifts.some((shift) => shift.day === index)).length} lidí</small></header><div>{people.flatMap((person) => person.shifts.filter((shift) => shift.day === index).map((shift) => <button className={`planned-card role-border-${person.role.toLowerCase()}`} key={shift.id} onClick={() => edit(person,shift)}><span className="avatar">{person.initials}</span><div><b>{person.name}</b><small>{shift.start}:00–{shift.end}:00</small></div><RoleBadge role={person.role}/></button>))}<span className="drop-hint">Přetáhněte sem zaměstnance</span></div></div>)}</div></section>;
}

function MonthlyPlanner({people,notify}:{people:Person[];notify:(message:string)=>void}) {
  const [cells,setCells] = useState<Record<string,MonthCell>>(() => {const result:Record<string,MonthCell>={};people.forEach((person) => {for(let day=1;day<=30;day++){const weekly=person.shifts.find((shift) => shift.day === day-16);result[`${person.id}-${day}`]=weekly?{value:`${weekly.start}:00–${weekly.end}:00`,status:"shift",note:""}:{value:"",status:"empty",note:""}}});return result});
  const [selected,setSelected] = useState<{person:Person;day:number}|null>(null);
  const cell = selected ? cells[`${selected.person.id}-${selected.day}`] : null;
  const save = (next:MonthCell) => {if(!selected)return;setCells((current) => ({...current,[`${selected.person.id}-${selected.day}`]:next}));setSelected(null);notify("Měsíční plán byl upraven.")};
  return <section className="monthly-planner panel"><div className="month-toolbar"><div><h3>Listopad 2026</h3><p>Kliknutím upravíte směnu nebo nepřítomnost</p></div><div className="cell-legend"><span className="shift">Směna</span><span className="empty">Bez směny</span><span className="vacation">Dovolená</span><span className="sick">Nemoc / jiné</span><span className="training">Školení</span></div></div><div className="month-sheet"><div className="month-head"><b>Zaměstnanec</b>{Array.from({length:30},(_,index) => <span key={index+1}>{index+1}<small>{["Ne","Po","Út","St","Čt","Pá","So"][(index+1)%7]}</small></span>)}</div>{people.map((person) => <div className="month-row" key={person.id}><div><span className="avatar">{person.initials}</span><b>{person.name}</b><RoleBadge role={person.role}/></div>{Array.from({length:30},(_,index) => {const day=index+1;const value=cells[`${person.id}-${day}`];return <button title={`${person.name} · ${day}. listopadu${value.note?` · ${value.note}`:""}`} className={`month-cell ${value.status}`} key={day} onClick={() => setSelected({person,day})}>{value.status === "vacation" ? "D" : value.status === "sick" ? "N" : value.status === "training" ? "Š" : value.status === "other" ? "J" : value.value || "—"}</button>})}</div>)}</div>{selected&&cell&&<div className="sheet-editor"><div><small>{selected.day}. LISTOPADU</small><h3>{selected.person.name}</h3></div><label>Typ dne<select value={cell.status} onChange={(event) => setCells((current) => ({...current,[`${selected.person.id}-${selected.day}`]:{...cell,status:event.target.value as MonthCell["status"]}}))}><option value="shift">Pracovní směna</option><option value="empty">Bez směny / volno</option><option value="vacation">Dovolená</option><option value="sick">Nemoc</option><option value="training">Školení</option><option value="other">Jiná nepřítomnost</option></select></label><label>Čas<input value={cell.value} disabled={cell.status!=="shift"} placeholder="8:00–16:00" onChange={(event) => setCells((current) => ({...current,[`${selected.person.id}-${selected.day}`]:{...cell,value:event.target.value}}))}/></label><label>Poznámka<input value={cell.note} placeholder="Důvod, místo školení…" onChange={(event) => setCells((current) => ({...current,[`${selected.person.id}-${selected.day}`]:{...cell,note:event.target.value}}))}/></label><button onClick={() => setSelected(null)}>Zrušit</button><button className="primary" onClick={() => save(cells[`${selected.person.id}-${selected.day}`])}>Uložit</button></div>}</section>;
}
createRoot(document.getElementById("root")!).render(<App />);
