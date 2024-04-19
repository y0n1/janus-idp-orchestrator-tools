export async function tryExists(
    path: string | URL,
    out_fileInfo?: Partial<Deno.FileInfo>,
  ): Promise<boolean> {
    let exists = false;
    try {
      const fileInfoInternal = await Deno.stat(path);
      exists = true;
      if (
        typeof out_fileInfo === "object" &&
        Array.from(Object.keys(out_fileInfo)).length === 0
      ) {
        Object.assign(out_fileInfo, fileInfoInternal);
      }
    } catch {
      // skip...
    }
  
    return exists;
  }
