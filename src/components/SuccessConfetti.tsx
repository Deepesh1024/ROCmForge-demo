import { useEffect } from 'react';
import confetti from 'canvas-confetti';

export function SuccessConfetti({ isSuccess }: { isSuccess: boolean }) {
    useEffect(() => {
        if (isSuccess) {
            const duration = 2000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 20, spread: 360, ticks: 60, zIndex: 60, colors: ['#10B981', '#ED1C24', '#FFFFFF'] };

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 20 * (timeLeft / duration);
                confetti({ ...defaults, particleCount, origin: { x: Math.random() - 0.2, y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: Math.random() + 0.2, y: Math.random() - 0.2 } });
            }, 250);

            return () => clearInterval(interval);
        }
    }, [isSuccess]);

    return null;
}
