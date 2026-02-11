import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const erdDefinition = `erDiagram
    users ||--o{ addresses : has
    users ||--o{ cart_items : has
    users ||--o{ wishlists : has
    users ||--o{ orders : places
    users ||--o{ notifications : receives
    users ||--o{ complaints : files
    users ||--o{ returns : requests
    users ||--o{ reviews : writes
    categories ||--o{ products : contains
    products ||--o{ product_images : has
    products ||--o{ product_specifications : has
    products ||--o{ product_suppliers : "supplied by"
    products ||--o{ cart_items : "added to"
    products ||--o{ wishlists : "saved in"
    products ||--o{ order_items : "ordered as"
    products ||--o{ supplier_order_items : "sourced as"
    products ||--o{ reviews : receives
    orders ||--o{ order_items : contains
    orders ||--o{ order_status_history : tracks
    orders ||--o{ rescue_contributions : generates
    orders |o--o{ complaints : "related to"
    orders ||--o{ returns : "returned via"
    orders }o--o| addresses : "shipped to"
    orders |o--o{ supplier_orders : triggers
    suppliers ||--o{ product_suppliers : provides
    suppliers ||--o{ supplier_orders : receives
    suppliers ||--o{ supplier_payments : "paid via"
    supplier_orders ||--o{ supplier_order_items : contains
    supplier_orders |o--o{ supplier_payments : "paid for"

    users {
        uuid id PK
        text email UK
        text full_name
        text role
    }
    products {
        uuid id PK
        text sku UK
        text name
        numeric price
        text category_id FK
    }
    orders {
        uuid id PK
        text order_number UK
        uuid user_id FK
        order_status status
        numeric total
    }
    suppliers {
        text id PK
        text name
        supplier_type type
    }`;

mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  er: { useMaxWidth: false },
});

const ERDDiagram = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    const render = async () => {
      if (!containerRef.current) return;
      const { svg } = await mermaid.render("erd-svg", erdDefinition);
      containerRef.current.innerHTML = svg;
      setRendered(true);
    };
    render();
  }, []);

  const getSvgString = () => {
    const svg = containerRef.current?.querySelector("svg");
    if (!svg) return null;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
    // Inline all computed styles so it renders standalone
    const styles = document.querySelectorAll("style");
    const styleEl = document.createElementNS("http://www.w3.org/2000/svg", "style");
    styles.forEach(s => { styleEl.textContent += s.textContent; });
    clone.insertBefore(styleEl, clone.firstChild);
    return { clone, width: svg.getBoundingClientRect().width, height: svg.getBoundingClientRect().height };
  };

  const downloadSVG = () => {
    const result = getSvgString();
    if (!result) return;
    const blob = new Blob([result.clone.outerHTML], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tajdo-erd.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPNG = () => {
    const result = getSvgString();
    if (!result) return;
    const scale = 2;
    const canvas = document.createElement("canvas");
    canvas.width = result.width * scale;
    canvas.height = result.height * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(scale, scale);
    const svgData = new XMLSerializer().serializeToString(result.clone);
    const dataUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgData);
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, result.width, result.height);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = "tajdo-erd.png";
      a.click();
    };
    img.src = dataUrl;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">TAJDO — Entity Relationship Diagram</h1>
          <div className="flex gap-2">
            <Button onClick={downloadSVG} disabled={!rendered} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" /> SVG
            </Button>
            <Button onClick={downloadPNG} disabled={!rendered} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" /> PNG
            </Button>
          </div>
        </div>
        <div ref={containerRef} className="overflow-auto bg-card rounded-lg border p-4" />
      </div>
    </div>
  );
};

export default ERDDiagram;
