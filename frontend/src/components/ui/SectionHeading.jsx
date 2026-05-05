export default function SectionHeading({ eyebrow, title, description, action, align = "left" }) {
  const isCenter = align === "center";
  
  return (
    <div className={`flex flex-col gap-4 ${isCenter ? 'items-center text-center' : 'md:flex-row md:items-end md:justify-between'}`}>
      <div className={`max-w-2xl space-y-3 ${isCenter ? 'mx-auto flex flex-col items-center' : ''}`}>
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <h2 className="text-3xl font-semibold tracking-tight text-main sm:text-4xl">{title}</h2>
        {description ? <p className="text-base leading-7 text-soft">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
