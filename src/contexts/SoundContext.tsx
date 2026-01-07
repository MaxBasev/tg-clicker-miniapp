import React, { createContext, useContext, useState, useRef, useCallback } from 'react';

interface SoundContextType {
    isMuted: boolean;
    toggleMute: () => void;
    playSound: (type: 'click' | 'success' | 'gameover' | 'move' | 'jump') => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isMuted, setIsMuted] = useState(() => {
        return localStorage.getItem('isMuted') === 'true';
    });

    const audioContext = useRef<AudioContext | null>(null);

    const toggleMute = useCallback(() => {
        setIsMuted(prev => {
            const newValue = !prev;
            localStorage.setItem('isMuted', newValue.toString());
            return newValue;
        });
    }, []);

    const playTone = useCallback((frequency: number, type: 'sine' | 'square' | 'sawtooth' | 'triangle', duration: number, volume: number = 0.1) => {
        if (isMuted) return;

        if (!audioContext.current) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        const ctx = audioContext.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);

        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + duration);
    }, [isMuted]);

    const playSound = useCallback((type: 'click' | 'success' | 'gameover' | 'move' | 'jump') => {
        if (isMuted) return;

        switch (type) {
            case 'click':
                playTone(400, 'sine', 0.1, 0.05);
                break;
            case 'move':
                playTone(200, 'sine', 0.05, 0.03); // Very short, quiet blip
                break;
            case 'jump':
                playTone(300, 'square', 0.1, 0.05);
                // Slide up effect for jump could be added here by ramping frequency
                break;
            case 'success':
                // Simple major triad arpeggio
                setTimeout(() => playTone(523.25, 'sine', 0.1, 0.1), 0);   // C5
                setTimeout(() => playTone(659.25, 'sine', 0.1, 0.1), 100); // E5
                setTimeout(() => playTone(783.99, 'sine', 0.2, 0.1), 200); // G5
                break;
            case 'gameover':
                // Descending tritone
                setTimeout(() => playTone(300, 'sawtooth', 0.3, 0.1), 0);
                setTimeout(() => playTone(200, 'sawtooth', 0.5, 0.1), 300);
                break;
        }
    }, [isMuted, playTone]);

    return (
        <SoundContext.Provider value={{ isMuted, toggleMute, playSound }}>
            {children}
        </SoundContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSound = () => {
    const context = useContext(SoundContext);
    if (context === undefined) {
        throw new Error('useSound must be used within a SoundProvider');
    }
    return context;
};
