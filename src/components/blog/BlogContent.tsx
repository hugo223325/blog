export default function BlogContent({ html }: { html: string }) {
  return (
    <div
      className="prose max-w-prose font-serif prose-a:text-sage dark:prose-a:text-[#8ab88e] prose-a:no-underline hover:prose-a:underline prose-headings:font-sans prose-headings:font-semibold"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
