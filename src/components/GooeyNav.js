import { useRef, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const GooeyNav = ({
  items,
  animationTime = 600,
  particleCount = 15,
  particleDistances = [60, 10],
  particleR = 80,
  timeVariance = 300,
  colors = [1, 2, 3, 4],
}) => {
  const containerRef = useRef(null);
  const navRef = useRef(null);
  const filterRef = useRef(null);
  const textRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [activeIndex, setActiveIndex] = useState(0);

  // ✅ Keep highlight synced with current route
  useEffect(() => {
    const currentIndex = items.findIndex((item) => item.href === location.pathname);
    if (currentIndex !== -1) {
      setActiveIndex(currentIndex);
      const li = navRef.current?.querySelectorAll("li")[currentIndex];
      if (li) updateEffectPosition(li);
    }
  }, [location.pathname, items]);

  // Small helper math for animation
  const noise = (n = 1) => n / 2 - Math.random() * n;
  const getXY = (distance, pointIndex, totalPoints) => {
    const angle =
      ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
    return [distance * Math.cos(angle), distance * Math.sin(angle)];
  };

  const createParticle = (i, t, d, r) => {
    let rotate = noise(r / 10);
    return {
      start: getXY(d[0], particleCount - i, particleCount),
      end: getXY(d[1] + noise(7), particleCount - i, particleCount),
      time: t,
      scale: 1 + noise(0.2),
      color: colors[Math.floor(Math.random() * colors.length)],
      rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10,
    };
  };

  const makeParticles = (element) => {
    const d = particleDistances;
    const r = particleR;
    const bubbleTime = animationTime * 2 + timeVariance;
    element.style.setProperty("--time", `${bubbleTime}ms`);
    for (let i = 0; i < particleCount; i++) {
      const t = animationTime * 2 + noise(timeVariance * 2);
      const p = createParticle(i, t, d, r);
      setTimeout(() => {
        const particle = document.createElement("span");
        const point = document.createElement("span");
        particle.classList.add("particle");
        particle.style.setProperty("--start-x", `${p.start[0]}px`);
        particle.style.setProperty("--start-y", `${p.start[1]}px`);
        particle.style.setProperty("--end-x", `${p.end[0]}px`);
        particle.style.setProperty("--end-y", `${p.end[1]}px`);
        particle.style.setProperty("--time", `${p.time}ms`);
        particle.style.setProperty("--scale", `${p.scale}`);
        particle.style.setProperty("--color", `var(--color-${p.color}, white)`);
        particle.style.setProperty("--rotate", `${p.rotate}deg`);
        point.classList.add("point");
        particle.appendChild(point);
        element.appendChild(particle);
        requestAnimationFrame(() => {
          element.classList.add("active");
        });
        setTimeout(() => {
          try {
            element.removeChild(particle);
          } catch {}
        }, t);
      }, 30);
    }
  };

  const updateEffectPosition = (element) => {
    if (!containerRef.current || !filterRef.current || !textRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const pos = element.getBoundingClientRect();
    const styles = {
      left: `${pos.x - containerRect.x}px`,
      top: `${pos.y - containerRect.y}px`,
      width: `${pos.width}px`,
      height: `${pos.height}px`,
    };
    Object.assign(filterRef.current.style, styles);
    Object.assign(textRef.current.style, styles);
    textRef.current.innerText = element.innerText;
  };

  const handleClick = (e, index, href) => {
    const liEl = e.currentTarget;
    if (activeIndex === index) return;
    setActiveIndex(index);
    updateEffectPosition(liEl);
    navigate(href);

    if (filterRef.current) {
      const particles = filterRef.current.querySelectorAll(".particle");
      particles.forEach((p) => filterRef.current.removeChild(p));
    }
    if (textRef.current) {
      textRef.current.classList.remove("active");
      void textRef.current.offsetWidth;
      textRef.current.classList.add("active");
    }
    if (filterRef.current) makeParticles(filterRef.current);
  };

  useEffect(() => {
    if (!navRef.current || !containerRef.current) return;
    const activeLi = navRef.current.querySelectorAll("li")[activeIndex];
    if (activeLi) {
      updateEffectPosition(activeLi);
      textRef.current?.classList.add("active");
    }
  }, [activeIndex]);

  return (
    <>
      <style>
        {`
        .effect {
          position: absolute;
          pointer-events: none;
          display: grid;
          place-items: center;
          z-index: 0;
          transition: all 0.3s ease;
        }

        .effect.text {
          color: white;
          transition: color 0.3s ease;
        }

        .effect.text.active {
          color: black;
        }

        .effect.filter {
          border-radius: 9999px;
          background: white;
          box-shadow: 0 0 10px rgba(255, 105, 180, 0.6),
                      0 0 20px rgba(255, 182, 193, 0.5);
          transition: all 0.3s ease;
        }

        li.active {
          color: #d63384;
          font-weight: 600;
          text-shadow: 0 0 4px rgba(255, 192, 203, 0.7);
        }

        li {
          position: relative;
          z-index: 2;
        }

        .particle,
        .point {
          display: block;
          opacity: 0;
          width: 12px;
          height: 12px;
          border-radius: 9999px;
          transform-origin: center;
        }

        .particle {
          --time: 5s;
          position: absolute;
          top: 50%;
          left: 50%;
          animation: particle calc(var(--time)) ease 1 -350ms;
        }

        .point {
          background: var(--color);
          opacity: 1;
          animation: point calc(var(--time)) ease 1 -350ms;
        }

        @keyframes particle {
          0% {
            transform: rotate(0deg) translate(calc(var(--start-x)), calc(var(--start-y)));
            opacity: 1;
          }
          100% {
            transform: rotate(calc(var(--rotate))) translate(calc(var(--end-x)), calc(var(--end-y)));
            opacity: 0;
          }
        }

        @keyframes point {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(var(--scale)); opacity: 1; }
          100% { transform: scale(0); opacity: 0; }
        }
      `}
      </style>

      <div className="relative flex justify-center" ref={containerRef}>
        <nav className="flex relative">
          <ul
            ref={navRef}
            className="flex gap-6 list-none m-0 p-0 relative z-[3] text-gray-700 font-medium"
          >
            {items.map((item, index) => (
              <li
                key={index}
                onClick={(e) => handleClick(e, index, item.href)}
                className={`relative cursor-pointer py-2 px-4 rounded-full transition duration-300 flex items-center gap-1 ${
                  activeIndex === index
                    ? "bg-white text-pink-600 shadow-md"
                    : "hover:bg-pink-100 hover:text-pink-600"
                }`}
              >
                {item.icon && <span>{item.icon}</span>}
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </nav>

        <span className="effect filter" ref={filterRef}></span>
        <span className="effect text" ref={textRef}></span>
      </div>
    </>
  );
};

export default GooeyNav;
