import { execSync } from "child_process";

export function evalRuby(rubyCode: string) {
  // language=ruby
  const codeWrappedErrorHandling = `
  begin
     ${rubyCode}
  rescue => e
    e.message
  end
  `;

  return execSync(
    `wasmer katei/ruby -- -e "puts(${codeWrappedErrorHandling})"`,
    { encoding: "utf-8" },
  );
}
