/**
 * Typing Boss - Lightweight Canvas Performance Chart
 * Renders an ultra-smooth speed & errors graph on HTML5 Canvas
 * with zero external dependencies and glassmorphic styling.
 */

export class PerformanceChart {
  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  /**
   * Render WPM and Errors timeline
   * @param {Array<{ second: number, grossWpm: number, netWpm: number, errors: number }>} timeline
   */
  render(timeline) {
    if (!this.canvas || !timeline || timeline.length === 0) return;

    // Handle high DPI displays
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = (rect.width || 600) * dpr;
    this.canvas.height = (rect.height || 220) * dpr;
    this.ctx.scale(dpr, dpr);

    const width = rect.width || 600;
    const height = rect.height || 220;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, width, height);

    const padding = { top: 25, right: 30, bottom: 35, left: 45 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    // Calculate maximum values for scale
    const maxWpm = Math.max(60, ...timeline.map(d => Math.max(d.grossWpm || 0, d.netWpm || 0))) + 10;
    const maxTime = Math.max(1, timeline[timeline.length - 1].second);

    // Draw horizontal grid lines
    const gridSteps = 4;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'right';

    for (let i = 0; i <= gridSteps; i++) {
      const val = Math.round((maxWpm / gridSteps) * i);
      const y = padding.top + chartH - (i / gridSteps) * chartH;

      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartW, y);
      ctx.stroke();

      ctx.fillText(`${val} wpm`, padding.left - 8, y + 3);
    }

    // Time labels on bottom
    ctx.textAlign = 'center';
    const timeSteps = Math.min(6, timeline.length);
    for (let i = 0; i <= timeSteps; i++) {
      const t = Math.round((maxTime / timeSteps) * i);
      const x = padding.left + (i / timeSteps) * chartW;
      const mins = Math.floor(t / 60);
      const secs = t % 60;
      const label = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
      ctx.fillText(label, x, height - 12);
    }

    if (timeline.length < 2) return;

    // Function to calculate coordinates
    const getX = (sec) => padding.left + (sec / maxTime) * chartW;
    const getY = (wpm) => padding.top + chartH - (Math.max(0, wpm) / maxWpm) * chartH;

    // 1. Draw Gross WPM Area & Line (Cyan / Neon Blue)
    const grossGrad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    grossGrad.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
    grossGrad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');

    ctx.beginPath();
    ctx.moveTo(getX(timeline[0].second), getY(timeline[0].grossWpm));
    timeline.forEach(pt => ctx.lineTo(getX(pt.second), getY(pt.grossWpm)));
    ctx.lineTo(getX(timeline[timeline.length - 1].second), padding.top + chartH);
    ctx.lineTo(getX(timeline[0].second), padding.top + chartH);
    ctx.closePath();
    ctx.fillStyle = grossGrad;
    ctx.fill();

    // Gross WPM Stroke
    ctx.beginPath();
    ctx.moveTo(getX(timeline[0].second), getY(timeline[0].grossWpm));
    timeline.forEach(pt => ctx.lineTo(getX(pt.second), getY(pt.grossWpm)));
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 2. Draw Net WPM Line (Emerald Green)
    ctx.beginPath();
    ctx.moveTo(getX(timeline[0].second), getY(timeline[0].netWpm));
    timeline.forEach(pt => ctx.lineTo(getX(pt.second), getY(pt.netWpm)));
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 3. Mark Error spikes (Coral Red dots)
    timeline.forEach(pt => {
      if (pt.errors > 0) {
        const x = getX(pt.second);
        const y = getY(pt.netWpm);
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    });

    // Chart Legend
    this.drawLegend(ctx, padding.left + 10, padding.top - 8);
  }

  drawLegend(ctx, startX, y) {
    ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'left';

    // Gross WPM legend
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(startX, y - 8, 12, 3);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.fillText('Gross WPM', startX + 16, y - 5);

    // Net WPM legend
    const netX = startX + 100;
    ctx.fillStyle = '#10b981';
    ctx.fillRect(netX, y - 8, 12, 3);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.fillText('Net WPM', netX + 16, y - 5);

    // Error Marker legend
    const errX = netX + 90;
    ctx.beginPath();
    ctx.arc(errX + 4, y - 6, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ef4444';
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.fillText('Mistakes', errX + 14, y - 5);
  }
}
