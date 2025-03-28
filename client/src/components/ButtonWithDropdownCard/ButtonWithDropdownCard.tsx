import Button from "../Button/Button";
import DropdownCard from "../DropdownCard/DropdownCard";
import ellipsisIcon from "../../assets/ellipsis-solid.svg";
import { useState, useEffect, useRef, MouseEventHandler } from "react";

type DropdownCardProps = {
    data: Array<{
        label: string;
        onClick: MouseEventHandler<HTMLLIElement>;
    }>;
};

const ButtonWithDropdownCard = ({ data }: DropdownCardProps) => {
    const [open, setOpen] = useState(false);
    const drop = useRef<HTMLDivElement>(null);

    function handleClick(event: MouseEvent) {
        if (
            drop.current &&
            !drop.current.contains(event.target as Node) &&
            open
        ) {
            setOpen(false);
        }
    }

    useEffect(() => {
        document.addEventListener("mousedown", handleClick);

        return () => {
            document.removeEventListener("mousedown", handleClick);
        };
    }, [open]);
    return (
        <div
            className="dropdown"
            style={{ position: "relative", margin: "16px" }}
            ref={drop}
        >
            <Button
                type="button"
                styling="hover:cursor-pointer flex justify-center items-center"
                icon={ellipsisIcon}
                onClick={() => setOpen(!open)}
            />
            {open && <DropdownCard data={data} />}
        </div>
    );
};

export default ButtonWithDropdownCard;
