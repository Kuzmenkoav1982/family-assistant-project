import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SkillData {
  skill: string;
  score: number;
  maxScore: number;
  color: string;
}

interface SkillsRadarChartProps {
  skills: SkillData[];
  title?: string;
  size?: number;
}

export default function SkillsRadarChart({ 
  skills, 
  title = 'Профиль навыков',
  size = 300 
}: SkillsRadarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.35;
    const numSkills = skills.length;

    ctx.clearRect(0, 0, size, size);

    const levels = 5;
    for (let i = levels; i > 0; i--) {
      ctx.beginPath();
      const levelRadius = (radius / levels) * i;
      
      for (let j = 0; j <= numSkills; j++) {
        const angle = (j * 2 * Math.PI) / numSkills - Math.PI / 2;
        const x = centerX + levelRadius * Math.cos(angle);
        const y = centerY + levelRadius * Math.sin(angle);
        
        if (j === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.strokeStyle = i === levels ? '#e5e7eb' : '#f3f4f6';
      ctx.lineWidth = i === levels ? 2 : 1;
      ctx.stroke();
    }

    for (let i = 0; i < numSkills; i++) {
      const angle = (i * 2 * Math.PI) / numSkills - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.beginPath();
    skills.forEach((skill, i) => {
      const percentage = skill.maxScore > 0 ? skill.score / skill.maxScore : 0;
      const angle = (i * 2 * Math.PI) / numSkills - Math.PI / 2;
      const distance = radius * percentage;
      const x = centerX + distance * Math.cos(angle);
      const y = centerY + distance * Math.sin(angle);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();

    skills.forEach((skill, i) => {
      const percentage = skill.maxScore > 0 ? skill.score / skill.maxScore : 0;
      const angle = (i * 2 * Math.PI) / numSkills - Math.PI / 2;
      const distance = radius * percentage;
      const x = centerX + distance * Math.cos(angle);
      const y = centerY + distance * Math.sin(angle);
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = skill.color || '#3b82f6';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    ctx.font = '12px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#374151';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    skills.forEach((skill, i) => {
      const angle = (i * 2 * Math.PI) / numSkills - Math.PI / 2;
      const labelDistance = radius + 30;
      const x = centerX + labelDistance * Math.cos(angle);
      const y = centerY + labelDistance * Math.sin(angle);
      
      const words = skill.skill.split(' ');
      if (words.length > 2) {
        ctx.fillText(words.slice(0, 2).join(' '), x, y - 6);
        ctx.fillText(words.slice(2).join(' '), x, y + 8);
      } else {
        ctx.fillText(skill.skill, x, y);
      }
      
      const percentage = Math.round((skill.score / skill.maxScore) * 100);
      ctx.font = 'bold 11px system-ui';
      ctx.fillStyle = skill.color || '#3b82f6';
      ctx.fillText(`${percentage}%`, x, y + (words.length > 2 ? 22 : 16));
      ctx.font = '12px system-ui';
      ctx.fillStyle = '#374151';
    });

  }, [skills, size]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="max-w-full h-auto"
        />
      </CardContent>
    </Card>
  );
}