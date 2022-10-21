import React, { FC } from 'react';
import './App.scss';
import { Button } from 'antd';

export const App: FC = () => {
	return (
		<div className="example">IT WORKS
			<Button type="primary">Primary Button</Button>
		</div>
	);
};

