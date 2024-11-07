import React from 'react';
import '../styles/Loader.css';

export const Loader: React.FC = () => {
	return (
		<div className="loader-container">
			<div className="rocket-loader">
				🚀
				<div className="rocket-trail">
					<span>✨</span>
					<span>✨</span>
					<span>✨</span>
				</div>
			</div>
		</div>
	);
}; 