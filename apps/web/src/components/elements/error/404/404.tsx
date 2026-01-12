"use client";

import { Button } from "@klayk/ui/components/ui/button";
import { Gamepad2, Home, ShoppingBag, ZapIcon } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Оптимізуємо константи, винесемо їх за межі компонента
const NEON_GREEN = "#00FF66";
const DRONE_COLORS = [
  "#00FF66", // Зелений (за замовчуванням)
  "#FF00FF", // Рожевий
  "#00FFFF", // Блакитний
  "#FFFF00", // Жовтий
  "#FF3366", // Червоний
];

// Оптимізуємо функцію для отримання випадкової позиції
const getRandomPosition = (width: number, height: number, padding: number) => {
  return {
    x: Math.random() * (width - padding * 2) + padding - width / 2,
    y: Math.random() * (height - padding * 2) + padding - height / 2,
  };
};

// Оптимізуємо функцію для плавного руху
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

export default function NotFoundPage() {
  // Зменшуємо кількість станів, об'єднуємо пов'язані стани
  const [dronePosition, setDronePosition] = useState({ x: 0, y: 0 });
  const [droneTarget, setDroneTarget] = useState({ x: 0, y: 0 });
  const [droneState, setDroneState] = useState({
    hover: false,
    clicked: false,
    scale: 1,
    dragging: false,
    color: NEON_GREEN,
    turboMode: false,
    controlMode: "auto" as "auto" | "keyboard" | "mouse",
  });
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [showControls, setShowControls] = useState(false);

  // Використовуємо useRef для зберігання значень, які не впливають на рендеринг
  const droneRef = useRef<HTMLButtonElement>(null);
  const animationFrameRef = useRef<number>(1);
  const frameCount = useRef(0);
  const currentPositionRef = useRef(dronePosition);
  const currentTargetRef = useRef(droneTarget);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const lastClickTimeRef = useRef(0);
  const keyPressedRef = useRef<{ [key: string]: boolean }>({});
  const isUserControlledRef = useRef(false);
  const colorChangeInterval = useRef<NodeJS.Timeout | null>(null);

  // Мемоізуємо значення, щоб уникнути зайвих обчислень
  const isUserControlled = useMemo(
    () => droneState.controlMode !== "auto",
    [droneState.controlMode],
  );

  // Оновлюємо ref при зміні стану
  useEffect(() => {
    isUserControlledRef.current = isUserControlled;
  }, [isUserControlled]);

  // Ініціалізація розміру вікна - оптимізуємо, додаємо throttle
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, 100); // Додаємо затримку 100мс для throttle
    };

    // Встановлюємо початковий розмір
    handleResize();

    // Додаємо слухач подій
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  // Автоматична зміна кольору дрона
  useEffect(() => {
    colorChangeInterval.current = setInterval(() => {
      setDroneState((prev) => {
        const currentIndex = DRONE_COLORS.indexOf(prev.color);
        const nextIndex = (currentIndex + 1) % DRONE_COLORS.length;
        return {
          ...prev,
          color: DRONE_COLORS[nextIndex],
        };
      });
    }, 3000); // Змінюємо колір кожні 3 секунди

    return () => {
      if (colorChangeInterval.current) {
        clearInterval(colorChangeInterval.current);
      }
    };
  }, []);

  // Оптимізуємо обробник клавіатури з useCallback
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (droneState.controlMode === "keyboard") {
        keyPressedRef.current[e.key] = true;
      }
    },
    [droneState.controlMode],
  );

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (droneState.controlMode === "keyboard") {
        keyPressedRef.current[e.key] = false;
      }

      // Перемикання режиму керування на клавішу 'k'
      if (e.key === "k") {
        setDroneState((prev) => ({
          ...prev,
          controlMode: prev.controlMode === "keyboard" ? "auto" : "keyboard",
        }));
      }

      // Перемикання режиму турбо на клавішу 't'
      if (e.key === "t") {
        setDroneState((prev) => ({
          ...prev,
          turboMode: !prev.turboMode,
        }));
      }

      // Зміна кольору на клавішу 'c'
      if (e.key === "c") {
        setDroneState((prev) => {
          const currentIndex = DRONE_COLORS.indexOf(prev.color);
          const nextIndex = (currentIndex + 1) % DRONE_COLORS.length;
          return {
            ...prev,
            color: DRONE_COLORS[nextIndex],
          };
        });
      }
    },
    [droneState.controlMode],
  );

  // Оптимізуємо обробники для перетягування дрона
  const handleDroneMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (droneState.controlMode !== "mouse") {
        setDroneState((prev) => ({
          ...prev,
          controlMode: "mouse",
          dragging: true,
        }));
      } else {
        setDroneState((prev) => ({
          ...prev,
          dragging: true,
        }));
      }

      dragStartRef.current = {
        x: e.clientX - currentPositionRef.current.x,
        y: e.clientY - currentPositionRef.current.y,
      };

      // Запобігаємо виділенню тексту при перетягуванні
      e.preventDefault();
    },
    [droneState.controlMode],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (droneState.dragging) {
        const newX = e.clientX - dragStartRef.current.x;
        const newY = e.clientY - dragStartRef.current.y;

        currentPositionRef.current = { x: newX, y: newY };

        // Оновлюємо DOM напряму через ref для кращої продуктивності
        if (droneRef.current) {
          droneRef.current.style.left = `calc(50% + ${newX}px)`;
          droneRef.current.style.top = `calc(50% + ${newY}px)`;
        }

        // Оновлюємо стан рідше для кращої продуктивності
        if (frameCount.current % 5 === 0) {
          setDronePosition({ x: newX, y: newY });
        }

        frameCount.current++;
      }
    },
    [droneState.dragging],
  );

  const handleMouseUp = useCallback(() => {
    setDroneState((prev) => ({
      ...prev,
      dragging: false,
    }));
  }, []);

  // Додаємо обробники подій для перетягування
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleKeyDown, handleKeyUp, handleMouseMove, handleMouseUp]);

  // Оптимізуємо ефект для автоматичного польоту дрона
  useEffect(() => {
    if (windowSize.width === 0 || windowSize.height === 0) return;

    // Оновлюємо поточні значення в refs
    currentPositionRef.current = dronePosition;

    // Встановлюємо випадкову ціль для дрона
    const setRandomTarget = () => {
      const padding = 80; // Зменшений відступ від країв екрану для більшої площі польоту
      const newTarget = getRandomPosition(
        windowSize.width,
        windowSize.height,
        padding,
      );
      currentTargetRef.current = newTarget;
      setDroneTarget(newTarget);
    };

    // Початкова ціль
    if (!droneTarget.x && !droneTarget.y && !isUserControlledRef.current) {
      setRandomTarget();
    }

    // Функція анімації польоту з плавним рухом
    const animateDrone = () => {
      // Якщо дрон перетягується, не рухаємо його
      if (droneState.dragging) {
        animationFrameRef.current = requestAnimationFrame(animateDrone);
        return;
      }

      let vx = 0;
      let vy = 0;
      let angle = 0;

      // Керування клавіатурою
      if (droneState.controlMode === "keyboard") {
        const speed = droneState.turboMode ? 8 : 4;

        if (keyPressedRef.current.ArrowUp || keyPressedRef.current.w)
          vy = -speed;
        if (keyPressedRef.current.ArrowDown || keyPressedRef.current.s)
          vy = speed;
        if (keyPressedRef.current.ArrowLeft || keyPressedRef.current.a)
          vx = -speed;
        if (keyPressedRef.current.ArrowRight || keyPressedRef.current.d)
          vx = speed;

        // Розрахунок кута нахилу
        if (vx !== 0 || vy !== 0) {
          angle = Math.atan2(vy, vx) * (180 / Math.PI);
        }
      }
      // Автоматичний рух
      else if (droneState.controlMode === "auto") {
        // Розрахунок вектора руху
        const dx = currentTargetRef.current.x - currentPositionRef.current.x;
        const dy = currentTargetRef.current.y - currentPositionRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Якщо дрон досяг цілі, встановлюємо нову ціль
        if (distance < 5) {
          setRandomTarget();
          animationFrameRef.current = requestAnimationFrame(animateDrone);
          return;
        }

        // Плавний рух до цілі з прискоренням/сповільненням
        const progress = Math.min(
          1,
          1 -
            distance /
              Math.sqrt(
                windowSize.width * windowSize.width +
                  windowSize.height * windowSize.height,
              ),
        );
        const easedProgress = easeInOutCubic(progress);

        // Базова швидкість з плавним сповільненням при наближенні до цілі
        const baseSpeed = droneState.turboMode ? 5 : 2.5;
        const speed = baseSpeed * (1 - easedProgress * 0.7);

        vx = (dx / distance) * speed;
        vy = (dy / distance) * speed;

        // Розрахунок кута нахилу
        angle = Math.atan2(vy, vx) * (180 / Math.PI);
      }

      // Оновлюємо поточну позицію без перерендеру з плавним переходом
      if (vx !== 0 || vy !== 0) {
        currentPositionRef.current = {
          x: currentPositionRef.current.x + vx,
          y: currentPositionRef.current.y + vy,
        };
      }

      // Оновлюємо DOM напряму через ref для кращої продуктивності
      if (droneRef.current) {
        droneRef.current.style.left = `calc(50% + ${currentPositionRef.current.x}px)`;
        droneRef.current.style.top = `calc(50% + ${currentPositionRef.current.y}px)`;

        // Додаємо нахил дрона в напрямку руху для більш реалістичного ефекту
        // Обмежуємо кут нахилу для більш природного вигляду
        const maxTilt = 15; // Максимальний кут нахилу
        const tiltAngle = Math.max(-maxTilt, Math.min(maxTilt, angle));

        droneRef.current.style.transform = `translate(-50%, -50%) scale(${droneState.scale}) rotate(${tiltAngle}deg)`;
      }

      // Оновлюємо state рідше (кожні 6 кадрів) для уникнення частих перерендерів
      if (frameCount.current % 6 === 0) {
        setDronePosition(currentPositionRef.current);
      }

      frameCount.current++;
      animationFrameRef.current = requestAnimationFrame(animateDrone);
    };

    // Запускаємо анімацію
    animationFrameRef.current = requestAnimationFrame(animateDrone);

    // Змінюємо ціль рідше для кращої продуктивності
    const targetInterval = setInterval(
      () => {
        if (droneState.controlMode === "auto") {
          setRandomTarget();
        }
      },
      Math.random() * 5000 + 10000,
    ); // Збільшуємо інтервал для кращої продуктивності

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      clearInterval(targetInterval);
    };
  }, [
    windowSize,
    droneTarget,
    droneState.dragging,
    droneState.controlMode,
    droneState.turboMode,
    droneState.scale,
    dronePosition,
  ]);

  // Оновлюємо currentTargetRef при зміні droneTarget
  useEffect(() => {
    currentTargetRef.current = droneTarget;
  }, [droneTarget]);

  // Оновлюємо currentPositionRef при зміні dronePosition
  useEffect(() => {
    currentPositionRef.current = dronePosition;
  }, [dronePosition]);

  // Обробник кліку на дрон - оптимізуємо з useCallback
  const handleDroneClick = useCallback(() => {
    setDroneState((prev) => ({
      ...prev,
      clicked: true,
      scale: 0.95,
    }));

    // Перевіряємо подвійний клік
    const now = Date.now();
    if (now - lastClickTimeRef.current < 300) {
      // Подвійний клік - вмикаємо турбо режим
      setDroneState((prev) => ({
        ...prev,
        turboMode: !prev.turboMode,
      }));
    }
    lastClickTimeRef.current = now;

    // Змінюємо колір при кліку
    setDroneState((prev) => {
      const currentIndex = DRONE_COLORS.indexOf(prev.color);
      const nextIndex = (currentIndex + 1) % DRONE_COLORS.length;
      return {
        ...prev,
        color: DRONE_COLORS[nextIndex],
      };
    });

    setTimeout(() => {
      setDroneState((prev) => ({
        ...prev,
        clicked: false,
        scale: prev.hover ? 1.1 : 1,
      }));
    }, 300);
  }, []);

  // Функція для перемикання режиму керування - оптимізуємо з useCallback
  const toggleControlMode = useCallback(() => {
    setDroneState((prev) => {
      if (prev.controlMode === "auto") {
        return { ...prev, controlMode: "keyboard" };
      } else if (prev.controlMode === "keyboard") {
        return { ...prev, controlMode: "mouse" };
      } else {
        return { ...prev, controlMode: "auto" };
      }
    });
  }, []);

  // Обробники наведення миші - оптимізуємо з useCallback
  const handleDroneMouseEnter = useCallback(() => {
    setDroneState((prev) => ({
      ...prev,
      hover: true,
      scale: prev.clicked ? 0.95 : 1.1,
    }));
  }, []);

  const handleDroneMouseLeave = useCallback(() => {
    setDroneState((prev) => ({
      ...prev,
      hover: false,
      scale: prev.clicked ? 0.95 : 1,
    }));
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden text-white font-['Poppins',sans-serif]">
      {/* Градієнтний чорний фон */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(circle at center, #121212 0%, #050505 100%)",
        }}
      />

      {/* Брендування AION у лівому верхньому куті як кнопка */}
      <Link
        href="/"
        className="absolute left-6 top-6 z-50 flex items-center group transition-all duration-300 hover:scale-105"
      >
        <div className="relative overflow-hidden rounded-lg bg-[#0D1426]/80 px-4 py-2 backdrop-blur-sm transition-all duration-300 group-hover:bg-[#0D1426] group-hover:shadow-[0_0_15px_rgba(0,255,102,0.5)]">
          <h1 className="text-2xl sm:text-3xl font-light tracking-[0.2em] text-white">
            <span className="relative">
              A
              <span className="absolute -left-1 top-0 opacity-30 blur-[2px]">
                A
              </span>
            </span>
            <span className="relative">
              I
              <span className="absolute -left-1 top-0 opacity-30 blur-[2px]">
                I
              </span>
            </span>
            <span className="relative">
              O
              <span className="absolute -left-1 top-0 opacity-30 blur-[2px]">
                O
              </span>
            </span>
            <span className="relative">
              N
              <span className="absolute -left-1 top-0 opacity-30 blur-[2px]">
                N
              </span>
            </span>
          </h1>
          <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-[#00FF66] to-transparent opacity-70 transition-all duration-500 group-hover:opacity-100" />
        </div>
      </Link>

      {/* Кнопка керування дроном */}
      <div className="absolute right-6 top-6 z-50">
        <Button
          onClick={() => setShowControls((prev) => !prev)}
          className="relative overflow-hidden rounded-full bg-[#0D1426]/80 p-2 text-white transition-all duration-300 hover:bg-[#0D1426] hover:shadow-[0_0_15px_rgba(0,255,102,0.5)]"
        >
          <Gamepad2 className="h-5 w-5 text-[#00FF66]" />
        </Button>

        {showControls && (
          <div className="absolute right-0 mt-2 w-64 rounded-lg bg-[#0D1426]/90 p-4 shadow-lg backdrop-blur-sm">
            <h3 className="mb-2 text-sm font-semibold text-[#00FF66]">
              Керування дроном
            </h3>

            <div className="mb-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span>Режим керування:</span>
                <Button
                  onClick={toggleControlMode}
                  className="h-7 rounded-md bg-[#1A1E2E] px-2 py-1 text-xs hover:bg-[#252A3A]"
                >
                  {droneState.controlMode === "auto"
                    ? "Автоматичний"
                    : droneState.controlMode === "keyboard"
                      ? "Клавіатура"
                      : "Миша"}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <span>Турбо режим:</span>
                <Button
                  onClick={() =>
                    setDroneState((prev) => ({
                      ...prev,
                      turboMode: !prev.turboMode,
                    }))
                  }
                  className={`h-7 rounded-md px-2 py-1 text-xs ${
                    droneState.turboMode
                      ? "bg-[#00FF66]/30 text-[#00FF66] hover:bg-[#00FF66]/40"
                      : "bg-[#1A1E2E] hover:bg-[#252A3A]"
                  }`}
                >
                  {droneState.turboMode ? "Увімкнено" : "Вимкнено"}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <span>Колір дрона:</span>
                <div className="flex space-x-1">
                  {DRONE_COLORS.map((color) => (
                    <button
                      key={`drone-color-${color}`}
                      type="button"
                      title={`Change drone color to ${color}`}
                      onClick={() =>
                        setDroneState((prev) => ({ ...prev, color }))
                      }
                      className={`h-5 w-5 rounded-full ${droneState.color === color ? "ring-2 ring-white" : ""}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1 text-xs text-gray-300">
              <p>
                <span className="font-semibold">Клавіатура:</span> Стрілки або
                WASD
              </p>
              <p>
                <span className="font-semibold">Миша:</span> Перетягування
              </p>
              <p>
                <span className="font-semibold">Клік:</span> Зміна кольору
              </p>
              <p>
                <span className="font-semibold">Подвійний клік:</span> Турбо
                режим
              </p>
              <p>
                <span className="font-semibold">Клавіші:</span> K (режим), T
                (турбо), C (колір)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Основний контент */}
      <div className="relative z-20 flex h-full w-full flex-col items-center justify-center px-4">
        {/* 404 з бордером замість неонового ефекту */}
        <div className="relative mb-4">
          <h1
            className="text-[8rem] sm:text-[10rem] md:text-[15rem] lg:text-[20rem] font-bold leading-none tracking-tighter"
            style={{
              color: "transparent", // Прозорий текст, щоб був видимий тільки бордер
              WebkitTextStroke: `3px ${NEON_GREEN}`, // Бордер для тексту
              filter: "drop-shadow(0 0 8px rgba(0, 255, 102, 0.7))", // Легке світіння для бордеру
              animation: "borderPulse 2s ease-in-out infinite",
            }}
          >
            404
          </h1>
        </div>

        {/* Текст помилки з оновленим шрифтом */}
        <div className="mb-8 max-w-2xl text-center">
          <p className="mb-2 text-xl font-medium text-gray-200 font-['Montserrat',sans-serif]">
            Ти заблукав серед нашого великого асортименту товарів!
          </p>
          <p className="text-lg text-gray-300 font-['Montserrat',sans-serif]">
            Не хвилюйтеся, ми допоможемо вам знайти саме те, що вам потрібно!
          </p>
        </div>

        {/* Кнопка повернення з плавною анімацією */}
        <Link href="/">
          <Button
            className="relative overflow-hidden rounded-full bg-transparent px-8 py-2 text-white transition-all duration-300 hover:bg-[#00FF66]/20 font-['Montserrat',sans-serif]"
            style={{
              border: "1px solid #00FF66",
              boxShadow:
                "0 0 10px rgba(0, 255, 102, 0.5), 0 0 20px rgba(0, 255, 102, 0.3) inset",
            }}
          >
            <span className="relative z-10 flex items-center">
              <Home className="mr-2 h-4 w-4" />
              Повернутися на домашню сторінку
            </span>
            <span className="absolute bottom-0 left-0 h-[2px] w-full bg-[#00FF66] animate-glow" />
          </Button>
        </Link>
      </div>

      {/* Літаючий інтерактивний дрон - оптимізований */}
      <button
        type="button"
        ref={droneRef}
        className="absolute z-40 h-[120px] w-[120px] cursor-pointer transition-transform duration-300 border-none bg-transparent p-0"
        style={{
          left: `calc(50% + ${dronePosition.x}px)`,
          top: `calc(50% + ${dronePosition.y}px)`,
          transform: `translate(-50%, -50%) scale(${droneState.scale})`,
          touchAction: "none",
        }}
        onClick={handleDroneClick}
        onMouseDown={handleDroneMouseDown}
        onMouseEnter={handleDroneMouseEnter}
        onMouseLeave={handleDroneMouseLeave}
      >
        {/* Основна частина дрона */}
        <div className="absolute left-1/2 top-1/2 h-[60px] w-[60px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-[#2A2E3E] to-[#1A1E2E] shadow-lg">
          {/* Центральне кільце */}
          <div
            className="absolute left-1/2 top-1/2 h-[40px] w-[40px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 opacity-80 animate-spin-slow"
            style={{ borderColor: droneState.color }}
          />

          {/* Центральний індикатор */}
          <div
            className="absolute left-1/2 top-1/2 h-[10px] w-[10px] -translate-x-1/2 -translate-y-1/2 rounded-full animate-pulse"
            style={{
              backgroundColor: droneState.color,
              boxShadow: `0 0 10px ${droneState.color}`,
              animation: droneState.turboMode
                ? "pulseFast 0.8s ease-in-out infinite"
                : "pulse 2s ease-in-out infinite",
            }}
          />

          {/* Логотип AION */}
          <div
            className="absolute left-1/2 top-[15px] -translate-x-1/2 text-[8px] font-bold"
            style={{ color: droneState.color }}
          >
            AION
          </div>

          {/* Індикатор режиму - тільки іконка турбо */}
          <div
            className="absolute bottom-[10px] left-1/2 -translate-x-1/2 text-[8px]"
            style={{ color: droneState.color }}
          >
            {droneState.turboMode && (
              <div className="flex items-center justify-center">
                <ZapIcon className="h-3 w-3" />
              </div>
            )}
          </div>
        </div>

        {/* Пропелери дрона - оптимізовані */}
        {[...Array(4)].map((_, i) => (
          <div
            key={`propeller-${i}`}
            className="absolute h-[25px] w-[25px]"
            style={{
              top: i < 2 ? "10px" : "auto",
              bottom: i >= 2 ? "10px" : "auto",
              left: i % 2 === 0 ? "10px" : "auto",
              right: i % 2 === 1 ? "10px" : "auto",
            }}
          >
            <div className="absolute left-1/2 top-1/2 h-[20px] w-[20px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#252A3A]">
              <div className="absolute left-1/2 top-1/2 h-[12px] w-[12px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1A1E2E]" />
            </div>
            <div
              className="absolute left-1/2 top-1/2 h-[2px] w-[25px] -translate-x-1/2 -translate-y-1/2"
              style={{
                backgroundColor: droneState.color,
                boxShadow: `0 0 5px ${droneState.color}`,
                animation: droneState.turboMode
                  ? `spin ${0.5 + i * 0.1}s linear infinite`
                  : `spin ${1 + i * 0.2}s linear infinite`,
                opacity: 0.8,
              }}
            />
            <div
              className="absolute left-1/2 top-1/2 h-[25px] w-[2px] -translate-x-1/2 -translate-y-1/2"
              style={{
                backgroundColor: droneState.color,
                boxShadow: `0 0 5px ${droneState.color}`,
                animation: droneState.turboMode
                  ? `spin ${0.5 + i * 0.1}s linear infinite`
                  : `spin ${1 + i * 0.2}s linear infinite`,
                opacity: 0.8,
              }}
            />
          </div>
        ))}

        {/* Пакет для доставки */}
        <div className="absolute bottom-[-40px] left-1/2 h-[30px] w-[40px] -translate-x-1/2 rounded-md bg-[#252A3A] shadow-lg">
          <div
            className="absolute left-1/2 top-[-15px] h-[20px] w-[2px] -translate-x-1/2"
            style={{
              backgroundColor: droneState.color,
              boxShadow: `0 0 5px ${droneState.color}`,
            }}
          />
          <div
            className="absolute left-1/2 top-[5px] -translate-x-1/2 text-[10px]"
            style={{ color: droneState.color }}
          >
            <ShoppingBag className="h-4 w-4" />
          </div>
        </div>

        {/* Світіння дрона - оптимізоване */}
        <div
          className="absolute inset-0 rounded-full opacity-20"
          style={{
            background: `radial-gradient(circle at center, ${droneState.color} 0%, transparent 70%)`,
            animation: droneState.turboMode
              ? "droneGlowFast 1.5s ease-in-out infinite"
              : "droneGlow 3s ease-in-out infinite",
          }}
        />
      </button>

      {/* Підключення Google Fonts - оптимізовано для швидшого завантаження */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&family=Poppins:wght@300;400;500&display=swap"
        rel="stylesheet"
      />

      {/* CSS анімації - оптимізовані */}
      <style jsx>{`
        @keyframes borderPulse {
          0%,
          100% {
            filter: drop-shadow(0 0 8px rgba(0, 255, 102, 0.7));
          }
          50% {
            filter: drop-shadow(0 0 12px rgba(0, 255, 102, 0.9));
          }
        }

        @keyframes droneGlow {
          0%,
          100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 0.3;
            transform: scale(1.2);
          }
        }

        @keyframes droneGlowFast {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.3);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes pulseFast {
          0%,
          100% {
            opacity: 0.7;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes spin {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        @keyframes spin-slow {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        @keyframes glow {
          0%,
          100% {
            opacity: 0.7;
            box-shadow: 0 0 10px rgba(0, 255, 102, 0.7);
          }
          50% {
            opacity: 1;
            box-shadow: 0 0 20px rgba(0, 255, 102, 1);
          }
        }
      `}</style>
    </div>
  );
}
