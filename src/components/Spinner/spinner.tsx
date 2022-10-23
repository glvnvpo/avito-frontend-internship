// @flow

import React, {FC, HTMLAttributes} from 'react';
import {Spin} from 'antd';
import './styles.scss';

enum Sizes {
    LARGE= 'large',
    MIDDLE = 'middle',
    SMALL = 'small'
}

enum Colors {
    ORANGE= 'orange',
    GREY = 'grey'
}

type Props = {
    size?: Sizes;
	color?: Colors;
}

export const Spinner: FC<Props & HTMLAttributes<any>> = ({size = Sizes.LARGE, color= Colors.ORANGE,
															 ...rest}) => {

	return (
		<div className={`spinner ${color}`}>
			<Spin size='large' {...rest} />
		</div>
	);
};