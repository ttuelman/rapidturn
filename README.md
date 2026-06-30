# Rapid Turn

Instant-quote, buy-now lathe parts ordering for minimal human interaction per order.

Customers choose from a limited set of materials and single-setup part features, receive a real-time quote, and click **Buy Now**. The backend generates Haas-compatible G-code, assigns an order/program number, and queues the job for the Haas CL-1 chucker lathe.

## MVP Scope

| Constraint | Value |
|------------|-------|
| Machine | Haas CL-1 chucker lathe |
| Materials | 6061 Aluminum, 1018 Cold-Rolled Steel |
| Max bar diameter | 0.5" |
| Setups | 1 (single setup only) |
| Features | OD profile (up to 3 steps), front/back chamfer, face, part-off |

## Stack

- **Next.js 15** (App Router) + TypeScript + Tailwind CSS
- File-based order persistence (`data/orders.json`)
- REST API for quotes, orders, G-code download, and machine queue

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

- `/` — Landing page
- `/shop` — Part configurator with live quote and Buy Now
- `/machine` — Production queue dashboard for the CL-1

## API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/quote` | POST | Real-time quote from `PartSpec` JSON |
| `/api/orders` | GET/POST | List or create orders |
| `/api/gcode/[id]` | GET | Download G-code for an order |
| `/api/machine` | GET | View queue; `?next=true` returns next job for DNC |
| `/api/machine` | POST | Update job status (`dispatch`, `start`, `complete`, `fail`) |

## Order Flow

1. Customer configures part on `/shop`
2. Quote recalculates on every change (debounced 300ms)
3. **Buy Now** creates order, generates G-code (`O####` program number), queues for `haas-cl1-01`
4. Order auto-dispatches to machine queue
5. Shop floor uses `/machine` or polls `/api/machine?next=true` to load programs

## G-code

Programs are generated in standard Haas inch format (G20) with:

- Front face
- OD turning per segment (Z-negative from chuck)
- Optional chamfers
- Part-off cycle
- Program number matches order (`RT-1001` → `O1001`)

## Future Work

- Stripe/payment integration
- MTConnect or Haas Ethernet DNC push
- Drawing upload with feature extraction
- Tolerance and finish options
- Multi-machine routing
