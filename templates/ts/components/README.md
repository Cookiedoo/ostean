# Components

Maximum: 100 lines per source file.
Data modules import core and primitives only; lateral imports are prohibited.
No I/O, hardware, domain state, or presentation types in data modules.
UI modules live in ui/ and may import data modules and approved renderers.
UI-to-UI imports form a DAG with at most two composition hops.
Data imports do not increment UI composition depth.
UI events, DOM events, and interactive refs remain inside ui/.
Outbound events carry canonical schemas or TypeScript primitives.
Approved presentation results may feed runtime's approved renderer only.
Styles reference core/styles.css; standard controls have one master each.
Every function has a technical comment of ten words maximum.
