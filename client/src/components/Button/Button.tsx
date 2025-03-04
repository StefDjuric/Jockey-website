import { MouseEventHandler } from "react";

type ButtonProps = {
    type: "submit" | "button";
    label: string;
    icon?: string;
    styling: string;
    onClick?: MouseEventHandler<HTMLButtonElement>;
    disabled?: boolean;
};

function Button({
    type,
    label,
    styling,
    icon,
    onClick,
    disabled,
}: ButtonProps) {
    return (
        <button
            className={`${styling}`}
            type={type}
            onClick={onClick}
            disabled={disabled}
        >
            {icon && <img src={icon} alt={label} width={24} height={24} />}
            {label}
        </button>
    );
}

export default Button;
