import React from 'react'
import Navigation from './Navigation';

interface NavbarProps{
    isCollapsed:boolean;
    onResetwidth:() => void;
}

const Navbar:React.FC<NavbarProps> = ({
    isCollapsed,
    onResetwidth
}) => {
    return (
        <div>
            
        </div>
    )
}

export default Navbar