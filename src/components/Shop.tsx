import React, { useState, useEffect } from 'react';
import { useHapticFeedback } from '../hooks/useHapticFeedback';
import { useSound } from '../contexts/SoundContext';
import '../styles/Shop.css';

interface ShopProps {
    score: number;
    onPurchase: (cost: number, itemId: string) => void;
    onBack: () => void;
}

interface ShopItem {
    id: string;
    name: string;
    description: string;
    cost: number;
    icon: string;
    category: 'theme' | 'skin';
    purchased: boolean;
    active: boolean;
}

const INITIAL_ITEMS: ShopItem[] = [
    {
        id: 'theme_dark',
        name: 'Ночной режим',
        description: 'Темная тема для приложения',
        cost: 0,
        icon: '🌙',
        category: 'theme',
        purchased: true,
        active: true
    },
    {
        id: 'theme_neon',
        name: 'Неон',
        description: 'Яркие неоновые цвета',
        cost: 1000,
        icon: '🌈',
        category: 'theme',
        purchased: false,
        active: false
    },
    {
        id: 'skin_snake_golden',
        name: 'Золотая змейка',
        description: 'Эксклюзивный скин',
        cost: 500,
        icon: '👑',
        category: 'skin',
        purchased: false,
        active: false
    }
];

export const Shop: React.FC<ShopProps> = ({ score, onPurchase, onBack }) => {
    const { impactOccurred, notificationOccurred } = useHapticFeedback();
    const { playSound } = useSound();
    const [items, setItems] = useState<ShopItem[]>(() => {
        const saved = localStorage.getItem('shopItems');
        return saved ? JSON.parse(saved) : INITIAL_ITEMS;
    });

    useEffect(() => {
        localStorage.setItem('shopItems', JSON.stringify(items));
    }, [items]);

    const handlePurchase = (item: ShopItem) => {
        if (item.purchased) {
            // Activate logic
            setItems(prev => prev.map(i => {
                if (i.category === item.category) {
                    return { ...i, active: i.id === item.id };
                }
                return i;
            }));
            impactOccurred('light');
            playSound('click');
        } else {
            // Buy logic
            if (score >= item.cost) {
                onPurchase(item.cost, item.id);
                setItems(prev => prev.map(i =>
                    i.id === item.id ? { ...i, purchased: true } : i
                ));
                impactOccurred('medium');
                playSound('success');
                notificationOccurred('success');
            } else {
                impactOccurred('heavy');
                notificationOccurred('warning');
            }
        }
    };

    return (
        <div className="shop-screen">
            <div className="shop-header">
                <h2>Магазин</h2>
                <div className="user-balance">
                    {score} 🪙
                </div>
            </div>

            <div className="shop-grid">
                {items.map(item => (
                    <div
                        key={item.id}
                        className={`shop-item ${item.active ? 'active' : ''} ${!item.purchased && score < item.cost ? 'too-expensive' : ''}`}
                        onClick={() => handlePurchase(item)}
                    >
                        <div className="item-icon">{item.icon}</div>
                        <div className="item-info">
                            <h3>{item.name}</h3>
                            <p>{item.description}</p>
                        </div>
                        <div className="item-action">
                            {item.purchased ? (
                                item.active ? 'Выбрано' : 'Выбрать'
                            ) : (
                                `${item.cost} 🪙`
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <button className="back-button" onClick={() => {
                impactOccurred('light');
                playSound('click');
                onBack();
            }}>
                Назад
            </button>
        </div>
    );
};
