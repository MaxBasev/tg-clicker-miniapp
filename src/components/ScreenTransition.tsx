import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScreenTransitionProps {
	children: React.ReactNode;
	screenKey: string;
}

const variants = {
	initial: { opacity: 0, x: 20, scale: 0.95 },
	animate: { opacity: 1, x: 0, scale: 1 },
	exit: { opacity: 0, x: -20, scale: 0.95 }
};

export const ScreenTransition: React.FC<ScreenTransitionProps> = ({ children, screenKey }) => {
	return (
		<AnimatePresence mode="wait">
			<motion.div
				key={screenKey}
				variants={variants}
				initial="initial"
				animate="animate"
				exit="exit"
				transition={{ duration: 0.2, ease: "easeOut" }}
				style={{ width: '100%', height: '100%' }}
			>
				{children}
			</motion.div>
		</AnimatePresence>
	);
};