import type { Appearance } from './projection';

/** Internal reusable vector geometry. No external images, fonts, textures or models. */
export function Desk({ x, y, premium = false, vacant = false, clutter = false }: { x: number; y: number; premium?: boolean; vacant?: boolean; clutter?: boolean }) {
  return <g transform={`translate(${x} ${y})`} className="office-desk">
    <ellipse cy="43" rx="62" ry="10" fill="#273f4d" opacity=".08"/>
    <path d="M-58 9v33h8V13M47 9v33h8V13" fill="#9ba8ac"/>
    <path d="M-62 0l19-14h102L42 0Z" fill={premium ? '#b9a28b' : '#e4e9e7'}/>
    <path d="M-62 0H42v9H-62Z" fill={premium ? '#8c7763' : '#acb9bc'}/>
    <path d="M42 0l17-14v9L42 9Z" fill="#8c9da2"/>
    <rect x="-16" y="-46" width="41" height="29" rx="3" fill={vacant ? '#aab6bc' : '#294753'}/>
    <rect x="-12" y="-42" width="33" height="20" rx="1" fill={vacant ? '#cbd3d4' : '#a9d9d8'}/>
    {!vacant ? <path d="M-8-37H15M-8-32H7" stroke="#559699" strokeWidth="2"/> : null}
    <path d="M2-17v7m-9 0H14" stroke="#7d9097" strokeWidth="3"/>
    <path d="M-32-7h25l-4 5h-25Z" fill="#a6b3b7"/>
    {clutter ? <><path d="M27-6h16v-8H27Z" fill="#e6bb75"/><path d="M28-17h14m-14 4h14" stroke="#f6f1e7" strokeWidth="3"/></> : null}
  </g>;
}
export function Person({ appearance: a, executive = false, document = false }: { appearance: Appearance; executive?: boolean; document?: boolean }) {
  return <g className="office-person-body">
    <ellipse cy="32" rx="15" ry="5" fill="#203a46" opacity=".13"/>
    <path d="M-9 9l-2 19h9l3-17 4 17h9L10 9Z" fill="#293e51"/>
    <path d="M-14-17Q0-25 14-17l4 28h-36Z" fill={a.clothing}/>
    {executive ? <path d="M-6-20l6 15 6-15M0-5V9" stroke="#e7ecee" strokeWidth="3" fill="none"/> : null}
    <path d="M-14-15l-8 14 11 4m25-18 8 14-10 4" stroke={a.clothing} strokeWidth="8" fill="none" strokeLinecap="round"/>
    <path d="M-10 3h5m15 0h-5" stroke={a.skin} strokeWidth="5" strokeLinecap="round"/>
    <rect x="-4" y="-25" width="8" height="8" fill={a.skin}/>
    <ellipse cy="-36" rx="12" ry="14" fill={a.skin}/>
    <path d={a.hairStyle % 2 ? 'M-12-33Q-18-59 4-53Q18-53 13-26L8-38Q-5-33-7-45Z' : 'M-12-33Q-15-55 0-54Q18-54 12-34L7-42Q-8-39-9-44Z'} fill={a.hair}/>
    {a.accessory ? <path d="M-9-36h7v5h-7Zm11 0h7v5H2ZM-2-34H2" stroke="#253644" strokeWidth="1.5" fill="none"/> : null}
    {document ? <rect x="7" y="-7" width="18" height="24" rx="2" transform="rotate(-12)" fill="#e4bb74"/> : null}
  </g>;
}
export function Plant({ x, y }: { x: number; y: number }) {
  return <g transform={`translate(${x} ${y})`}><path d="M-8 0H8L6 17H-6Z" fill="#d8d9d0"/><path d="M0 0v-27" stroke="#637d69" strokeWidth="3"/><ellipse cx="-7" cy="-16" rx="6" ry="11" transform="rotate(-30)" fill="#7a9b86"/><ellipse cx="7" cy="-20" rx="5" ry="12" transform="rotate(30)" fill="#8cad94"/></g>;
}
export function RoomProps({ kind, meeting }: { kind: string; meeting: boolean }) {
  return <g aria-hidden="true">
    <Plant x={89} y={107}/><Plant x={890} y={231}/>
    <rect x="110" y="32" width="72" height="55" rx="2" fill={kind === 'executive' ? '#8b7765' : '#bac8cb'}/>
    <path d="M113 51h66m-66 18h66" stroke="#f1eee8" strokeWidth="3"/>
    <path d="M121 40v10m12-10v10m15-10v10m13-10v10m-40 10v8m12-8v8m16-8v8" stroke="#607880" strokeWidth="8"/>
    <rect x="744" y="31" width="101" height="55" rx="3" fill="#f4f7f7" stroke="#b8c6cb" strokeWidth="3"/>
    <path d="M758 46h56m-56 9h27m-27 9h40" stroke="#7dadaa" strokeWidth="3"/>
    {kind !== 'staff' ? <><ellipse cx="743" cy="170" rx="93" ry="25" fill="#223b47" opacity=".08"/><path d="M697 145v34m87-34v34" stroke="#8c9ea3" strokeWidth="9"/><ellipse cx="743" cy="137" rx="93" ry="32" fill={kind === 'executive' ? '#bda58e' : '#cfdbda'}/>{[655, 697, 790, 833].map((x, i) => <rect key={x} x={x} y={i % 2 ? 166 : 91} width="22" height="29" rx="6" fill="#647987"/>)}<text x="743" y="218" textAnchor="middle" fill="#607681" fontSize="15">{meeting ? '近期組織討論 · 事件呈現' : kind === 'executive' ? '策略會議區' : '管理討論區'}</text></> : <><rect x="555" y="40" width="45" height="32" rx="3" fill="#cad5d7"/><rect x="559" y="34" width="37" height="9" fill="#f9faf8"/><path d="M561 60h30" stroke="#6f8c93" strokeWidth="4"/></>}
    {kind === 'executive' ? <><rect x="365" y="72" width="67" height="29" rx="8" fill="#9caeb4"/><rect x="368" y="61" width="60" height="20" rx="6" fill="#b3c1c4"/><ellipse cx="395" cy="125" rx="30" ry="12" fill="#b7a28c"/><rect x="249" y="34" width="61" height="38" fill="#d9e8e6" stroke="#9eb2b7"/><path d="M255 60l15-16 13 14 21-17" stroke="#658c8a" strokeWidth="4" fill="none"/></> : null}
  </g>;
}
