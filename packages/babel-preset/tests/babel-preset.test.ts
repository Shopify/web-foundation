import {exec} from 'child_process';
import {readFileSync, writeFileSync} from 'fs';
import {resolve as resolvePath} from 'path';

import shopifyCommonPreset from '../index';

describe('babel-preset-e2e-test', () => {
  describe('legacy decorator tests', () => {
    it('runs babel successfully when typescript is true', async () => {
      const baseConfig = configFactory({typescript: true});
      writeFileSync(
        resolvePath(__dirname, './fixtures/babel.config.json'),
        JSON.stringify(baseConfig, null, 2),
        'utf-8',
      );
      const baseConfigPath = resolvePath(
        __dirname,
        './fixtures/babel.config.json',
      );
      const {stdout} = await runBuild(baseConfigPath, 'test-script.ts');
      const exampleOutput = readFileSync(
        resolvePath(__dirname, './fixtures/base.example.txt'),
        'utf8',
      );
      expect(baseConfig.assumptions).toStrictEqual(
        expect.objectContaining({
          setPublicClassFields: true,
          privateFieldsAsProperties: true,
        }),
      );
      expect(stdout.trim()).toBe(exampleOutput);
    });

    it('runs babel without decorator proposals when typescript is false', async () => {
      const noDecorConfig = configFactory();
      writeFileSync(
        resolvePath(__dirname, './fixtures/babel.config.no-decorator.json'),
        JSON.stringify(configFactory(), null, 2),
        'utf-8',
      );
      const noDecorConfigPath = resolvePath(
        __dirname,
        './fixtures/babel.config.no-decorator.json',
      );
      const {stdout} = await runBuild(
        noDecorConfigPath,
        'test-script.no-decorator.ts',
      );
      const exampleOutput = readFileSync(
        resolvePath(__dirname, './fixtures/no-decorator.example.txt'),
        'utf8',
      );
      expect(noDecorConfig.assumptions).toStrictEqual({});
      expect(stdout.trim()).toBe(exampleOutput);
    });
  });
});

function runBuild(
  configPath: string,
  scriptPath: string,
): Promise<{error: any; stdout: string; stderr: string}> {
  const root = resolvePath(__dirname, './fixtures');
  return new Promise((resolve) => {
    exec(
      `npx babel --config-file ${configPath} ${scriptPath}`,
      {
        cwd: root,
      },
      (error, stdout, stderr) => {
        resolve({error, stdout, stderr});
      },
    );
  });
}

type FactoryOptions = Partial<{
  targets: string;
  env: 'test' | 'development';
  modules: string;
  typescript: boolean;
  legacyDecorators: boolean;
}>;

function configFactory({
  targets = 'current node',
  env = 'test',
  modules = 'commonjs',
  typescript = false,
}: FactoryOptions = {}) {
  const config = shopifyCommonPreset(
    {
      env() {
        return env;
      },
    },
    {modules, typescript},
  );
  config.targets = targets;
  return config;
}
