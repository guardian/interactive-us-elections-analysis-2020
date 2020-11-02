class Dodge {

  constructor(data, xScale, radius, padding) {

    const epsilon = 1e-3;
    let head = null;
    let tail = null;
    let queue = null;

    const circles = []

    data.map(d =>{

      circles.push(
      {
        id:d.id,
        x: xScale(d.swing),
        r: radius(d.population),
        data: d
      }
      )
      
    })


    circles.sort((a, b) => b.r - a.r)

    // Returns true if circle ⟨x,y⟩ intersects with any circle in the queue.
    function intersects(x, y, r) {
      let a = head;
      while (a) {
        const radius2 = (a.r + r + padding) ** 2;
        if (radius2 - epsilon > (a.x - x) ** 2 + (a.y - y) ** 2) {
          return true;
        }
        a = a.next;
      }
      return false;
    }

    // Place each circle sequentially.
    for (const b of circles) {
      // Choose the minimum non-intersecting tangent.
      if (intersects(b.x, b.y = b.r, b.r)) {
        let a = head;
        b.y = Infinity;
        do {
          let y = a.y + Math.sqrt((a.r + b.r + padding) ** 2 - (a.x - b.x) ** 2);
          if (y < b.y && !intersects(b.x, y, b.r)) b.y = y;
          a = a.next;
        } while (a);
      }

      // Add b to the queue.
      b.next = null;
      if (head === null) {
        head = tail = b;
        queue = head;
      } else tail = tail.next = b;
    }

    return circles;
  }
}


export default Dodge