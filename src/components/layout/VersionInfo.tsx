type VersionInfoProps = {
  version: string;
  commitHash?: string;
};

export function VersionInfo({ version, commitHash }: VersionInfoProps) {
  return (
    <span className="truncate text-xs text-neutral-500 dark:text-neutral-400">
      <span>v{version}</span>
      {commitHash ? <span className="ml-2 font-mono">{commitHash}</span> : null}
    </span>
  );
}
