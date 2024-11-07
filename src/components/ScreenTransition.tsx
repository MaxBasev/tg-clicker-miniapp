import { CSSTransition, SwitchTransition } from 'react-transition-group';

interface ScreenTransitionProps {
	screen: 'clicker' | 'games';
	children: React.ReactNode;
}

export const ScreenTransition: React.FC<ScreenTransitionProps> = ({
	screen,
	children
}) => {
	return (
		<SwitchTransition>
			<CSSTransition
				key={screen}
				timeout={300}
				classNames="screen"
			>
				{children}
			</CSSTransition>
		</SwitchTransition>
	);
}; 