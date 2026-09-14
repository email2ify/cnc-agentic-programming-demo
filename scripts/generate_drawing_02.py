# pyright: reportMissingImports=false

import FreeCAD as App
import FreeCADGui as Gui
import Part

Vector = App.Vector
doc = App.ActiveDocument

if doc is None:
    doc = App.newDocument("Drawing02")

# Replace only the previously generated model.
existing = doc.getObject("CNC_Part")
if existing:
    doc.removeObject(existing.Name)

def profile_line(radius_1, z_1, radius_2, z_2):
    """Create one profile edge in the XZ plane."""
    return Part.makeLine(
        Vector(radius_1, 0, z_1),
        Vector(radius_2, 0, z_2),
    )

edges = [
    # Centre to front diameter.
    profile_line(0, 0, 5, 0),

    # C1 chamfer: Ø10 to Ø12 over 1 mm.
    profile_line(5, 0, 6, -1),

    # M12 major diameter.
    profile_line(6, -1, 6, -10),

    # Thread relief: Ø12 to Ø9.
    profile_line(6, -10, 4.5, -10),
    profile_line(4.5, -10, 4.5, -14),

    # Ø12 step.
    profile_line(4.5, -14, 6, -14),
    profile_line(6, -14, 6, -18),

    # Taper: Ø16 to Ø10.
    profile_line(6, -18, 8, -18),
    profile_line(8, -18, 5, -38),

    # R4 transition.
    Part.Arc(
        Vector(5, 0, -38),
        Vector(6.171573, 0, -40.828427),
        Vector(9, 0, -42),
    ).toShape(),

    # R3 transition.
    Part.Arc(
        Vector(9, 0, -42),
        Vector(11.121320, 0, -42.878680),
        Vector(12, 0, -45),
    ).toShape(),

    # Ø24 rear flange.
    profile_line(12, -45, 12, -50),

    # Close the half-profile along the spindle centreline.
    profile_line(12, -50, 0, -50),
    profile_line(0, -50, 0, 0),
]

wire = Part.Wire(edges)
face = Part.Face(wire)

# Revolve around the Z spindle axis.
solid = face.revolve(
    Vector(0, 0, 0),
    Vector(0, 0, 1),
    360,
)

part = doc.addObject("PartDesign::Feature", "CNC_Part")
part.Label = "Drawing 02 - Cast Iron CNC Component"
part.Shape = solid
part.addProperty("App::PropertyString", "Material", "Manufacturing")
part.Material = "Cast Iron"
part.addProperty("App::PropertyLength", "FinishedLength", "Manufacturing")
part.FinishedLength = 50
part.addProperty("App::PropertyLength", "StockDiameter", "Manufacturing")
part.StockDiameter = 30

part.ViewObject.ShapeColor = (0.72, 0.72, 0.76)
doc.recompute()

Gui.activeDocument().activeView().viewAxonometric()
Gui.activeDocument().activeView().fitAll()