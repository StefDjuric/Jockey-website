import { Key, MouseEventHandler } from "react";

type DropdownCardProps = {
    data: Array<{
        label: string;
        onClick: MouseEventHandler<HTMLLIElement>;
    }>;
};

const DropdownCard: React.FC<DropdownCardProps> = ({
    data = [],
}: DropdownCardProps) => (
    <div className="shadow h-auto w-56 absolute">
        <ul className="text-left">
            {data.map((item, idx: Key | null | undefined) => (
                <li
                    key={idx}
                    className="p-3 border text-gray-700 hover:text-[#ffc300] hover:cursor-pointer bg-white"
                    onClick={item.onClick}
                >
                    {item.label}
                </li>
            ))}
        </ul>
    </div>
);

export default DropdownCard;
