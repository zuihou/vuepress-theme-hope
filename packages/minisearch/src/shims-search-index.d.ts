declare module "@temp/minisearch/index" {
  const searchIndex: Record<string, () => Promise<{ default: string }>>;

  export default searchIndex;
}
