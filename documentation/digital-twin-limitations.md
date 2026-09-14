# Digital Twin Limitations

The browser visualization in this repository is an educational digital twin for interview and training demonstration. It is not a certified physical-machine simulator and must not be used as approval to run a program.

The visualization does not replace:

- Controller-specific verification
- Collision detection
- Tool-offset verification
- Workholding verification
- Dry run
- Single-block proving
- Qualified CNC supervision

The Three.js scene uses original primitives for a representative training lathe and reuses the repository STL exports for the component and stock. The animation reads supported rapid and linear motion values from fetched NC text. Controller cycles such as `G70`, `G71` and `G76` are identified visibly as visual approximations only; they are not interpreted as certified canned-cycle behavior.

Before physical machining, verify the exact controller manual and syntax, tooling, insert geometry, offsets, workholding, clearances, spindle direction, cutting data, stock, program origin and machine limits. Complete a qualified dry run and single-block prove-out under appropriate supervision.
