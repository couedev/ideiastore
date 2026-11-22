"use client";

import { useEffect, useRef, useState, type PointerEvent, type KeyboardEvent } from "react";
import Confetti from "react-confetti";
import { Gift } from "lucide-react";
import styles from "./scratch-demo.module.css";

type Point = { x: number; y: number };

export default function ScratchDemo({ name, onReveal, demoOnly = true }: { name: string; onReveal: () => void; demoOnly?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scratching = useRef(false);
  const lastPoint = useRef<Point | null>(null);
  const moveCount = useRef(0);
  const revealedRef = useRef(false);
  const [revealed, setRevealed] = useState(false);
  const [started, setStarted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function paintCover() {
      if (!canvas || revealedRef.current) return;
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * ratio);
      canvas.height = Math.round(rect.height * ratio);
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) return;

      context.fillStyle = "#d9ded4";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.strokeStyle = "#15362C24";
      context.lineWidth = 2 * ratio;
      for (let offset = -canvas.height; offset < canvas.width + canvas.height; offset += 24 * ratio) {
        context.beginPath();
        context.moveTo(offset, 0);
        context.lineTo(offset + canvas.height, canvas.height);
        context.stroke();
      }
      canvas.style.backgroundColor = "transparent";
    }

    function updateViewport() {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    }

    const frame = window.requestAnimationFrame(() => {
      paintCover();
      updateViewport();
    });
    window.addEventListener("resize", updateViewport);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateViewport);
    };
  }, []);

  function reveal() {
    if (revealedRef.current) return;
    revealedRef.current = true;
    setProgress(100);
    setRevealed(true);
    setShowConfetti(true);
    onReveal();
  }

  function checkCoverage() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { willReadFrequently: true });
    if (!canvas || !context || revealedRef.current) return;
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const stride = Math.max(8, Math.round(8 * Math.min(window.devicePixelRatio || 1, 2)));
    let erased = 0;
    let sampled = 0;

    for (let y = 0; y < canvas.height; y += stride) {
      for (let x = 0; x < canvas.width; x += stride) {
        if (pixels[(y * canvas.width + x) * 4 + 3] < 128) erased += 1;
        sampled += 1;
      }
    }

    const percent = Math.round((erased / sampled) * 100);
    setProgress(percent);
    if (percent >= 40) reveal();
  }

  function scratchAt(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { willReadFrequently: true });
    if (!canvas || !context || revealedRef.current) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const point = {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
    const radius = 37 * scaleX;

    context.save();
    context.globalCompositeOperation = "destination-out";
    context.lineCap = "round";
    context.lineJoin = "round";
    if (lastPoint.current) {
      context.lineWidth = radius * 2;
      context.beginPath();
      context.moveTo(lastPoint.current.x, lastPoint.current.y);
      context.lineTo(point.x, point.y);
      context.stroke();
    } else {
      context.beginPath();
      context.arc(point.x, point.y, radius, 0, Math.PI * 2);
      context.fill();
    }
    context.restore();
    lastPoint.current = point;
    moveCount.current += 1;
    if (moveCount.current % 3 === 0) checkCoverage();
  }

  function startScratch(event: PointerEvent<HTMLCanvasElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    scratching.current = true;
    setStarted(true);
    lastPoint.current = null;
    scratchAt(event);
  }

  function stopScratch() {
    if (!scratching.current) return;
    scratching.current = false;
    lastPoint.current = null;
    checkCoverage();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLCanvasElement>) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    reveal();
  }

  return (
    <div className={styles.demo}>
      <div className={styles.card}>
        <span className={styles.cardEyebrow}>AMIGO SECRETO NATALINO</span>
        <div className={styles.scratchArea}>
          <div className={styles.result} aria-hidden={!revealed} role="status">
            <Gift size={29} aria-hidden="true" />
            <span>Você tirou</span>
            <strong>{name}</strong>
            <small>Surpresa!</small>
          </div>
          <canvas
            ref={canvasRef}
            className={`${styles.cover} ${revealed ? styles.coverRevealed : ""}`}
            role="button"
            tabIndex={revealed ? -1 : 0}
            aria-label="Raspe para revelar o nome. Pressione Enter para revelar pelo teclado."
            onPointerDown={startScratch}
            onPointerMove={(event) => { if (scratching.current) scratchAt(event); }}
            onPointerUp={stopScratch}
            onPointerCancel={stopScratch}
            onKeyDown={handleKeyDown}
          />
          {!started && !revealed && <span className={styles.scratchPrompt} aria-hidden="true">RASPE AQUI</span>}
        </div>
        <p className={styles.instruction}>{revealed ? "Nome revelado!" : "Arraste o dedo para raspar"}</p>
        {!revealed && <span className={styles.progress} aria-live="polite">{progress}% raspado</span>}
      </div>
      {revealed && demoOnly && (
        <p className={styles.disclaimer} role="status">
          Isso é só uma demonstração. Não significa que você tirou <strong>{name}</strong>.
        </p>
      )}
      {showConfetti && viewport.width > 0 && (
        <Confetti
          width={viewport.width}
          height={viewport.height}
          numberOfPieces={260}
          recycle={false}
          colors={["#F8F5EA", "#721218", "#d9ae62", "#15362C", "#ffffff"]}
          style={{ position: "fixed", inset: 0, zIndex: 100, pointerEvents: "none" }}
          onConfettiComplete={() => setShowConfetti(false)}
        />
      )}
    </div>
  );
}
