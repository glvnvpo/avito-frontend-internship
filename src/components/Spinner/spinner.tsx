// @flow

import React, {FC, HTMLAttributes} from 'react';
import {Spin} from 'antd';
import './styles.scss';

export enum Sizes {
    LARGE= 'large',
    SMALL = 'small'
}

export enum Colors {
    ORANGE= 'orange',
    GREY = 'grey',
    BLUE = 'blue'
}

type Props = {
    size?: Sizes;
	color?: Colors;
}

export const Spinner: FC<Props & HTMLAttributes<any>> = ({size = Sizes.LARGE, color = Colors.ORANGE,
															 ...rest}) => {

	return (
		<div className={`spinner ${color}`}>
			<Spin size={size} {...rest} />
		</div>
	);
};