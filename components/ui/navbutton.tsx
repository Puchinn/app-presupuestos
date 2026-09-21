interface Props {
  label: string;
  Icon: React.ElementType;
  isActive?: boolean;
  onClick?: VoidFunction;
  open?: boolean;
}

export function NavButton({ label, Icon, onClick, open, isActive }: Props) {
  return (
    <button
      className="flex flex-col max-w-15 w-full mx-auto justify-center items-center"
      onClick={onClick}
      type="button"
    >
      <Icon
        className={`${isActive && "shadow bg-white text-gray-950"} w-7 hover:shadow hover:text-gray-950 text-gray-600 h-7 p-1.5 rounded-md`}
      />
      <span
        className={`${isActive && "text-gray-950"} mt-1 text-[12px] text-gray-600 ${!open && "opacity-0"}`}
      >
        {label}
      </span>
    </button>
  );
}
