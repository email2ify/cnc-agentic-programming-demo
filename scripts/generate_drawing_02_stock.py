# pyright: reportMissingImports=false

import FreeCAD as App
import FreeCADGui as Gui
import Part

doc = App.ActiveDocument

if doc is None:
    raise RuntimeError("Open drawing-02.FCStd before running this script.")

existing = doc.getObject("Raw_Stock")
if existing:
    doc.removeObject(existing.Name)

# Ø30 x 65 mm cylindrical stock.
stock_shape = Part.makeCylinder(
    15,                  # Radius
    65,                  # Length
    App.Vector(0, 0, 0),
    App.Vector(0, 0, -1)
)

stock = doc.addObject("PartDesign::Feature", "Raw_Stock")
stock.Label = "Raw Stock - Cast Iron Dia 30 x 65 mm"
stock.Shape = stock_shape

stock.addProperty(
    "App::PropertyString",
    "Material",
    "Manufacturing"
)
stock.Material = "Cast Iron"

stock.addProperty(
    "App::PropertyLength",
    "StockDiameter",
    "Manufacturing"
)
stock.StockDiameter = 30

stock.addProperty(
    "App::PropertyLength",
    "StockLength",
    "Manufacturing"
)
stock.StockLength = 65

# Transparent stock reveals the finished component.
stock.ViewObject.ShapeColor = (0.45, 0.48, 0.52)
stock.ViewObject.Transparency = 75

doc.recompute()
doc.save()

Gui.activeDocument().activeView().viewAxonometric()
Gui.activeDocument().activeView().fitAll()