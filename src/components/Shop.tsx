import React from 'react';
import { useHapticFeedback } from '../hooks/useHapticFeedback';
import { useSound } from '../contexts/SoundContext';
import '../styles/Shop.css';

// ShopProps removed in favor of refined definition below

export interface ShopItem {
    id: string;
    name: string;
    description: string;
    cost: number;
    icon: string;
    category: 'theme' | 'skin';
    purchased: boolean;
    active: boolean;
}

interface ShopProps {
    score: number;
    items: ShopItem[];
    onItemClick: (item: ShopItem) => void;
    onBack: () => void;
}

export const Shop: React.FC<ShopProps> = ({ score, items, onItemClick, onBack }) => {
    const { impactOccurred } = useHapticFeedback();
    const { playSound } = useSound();

    return (
        <div className="shop-screen">
            <div className="shop-header">
                <h2>Shop</h2>
                <div className="user-balance">
                    {score} 🪙
                </div>
            </div>

            <div className="shop-grid">
                {items.map(item => (
                    <div
                        key={item.id}
                        className={`shop-item ${item.active ? 'active' : ''} ${!item.purchased && score < item.cost ? 'too-expensive' : ''}`}
                        onClick={() => onItemClick(item)}
                    >
                        <div className="item-icon">{item.icon}</div>
                        <div className="item-info">
                            <h3>{item.name}</h3>
                            <p>{item.description}</p>
                        </div>
                        <div className="item-action">
                            {item.purchased ? (
                                item.active ? 'Selected' : 'Select'
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
                Back
            </button>
        </div>
    );
};
