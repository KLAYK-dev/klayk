#!/usr/bin/env node

/**
 * Drizzle MCP Server - Interactive Setup & Commands
 *
 * Usage:
 *   node mcp-commands.js [command]
 *
 * Available commands:
 *   - verify    : Run MCP setup verification
 *   - start     : Start MCP server
 *   - start-dev : Start MCP server with debug
 *   - docs      : Show available documentation
 *   - help      : Show this help message
 */

const fs = require("node:fs");
const { exec } = require("node:child_process");

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

const print = (text, color = "reset") => {
  console.log(`${colors[color]}${text}${colors.reset}`);
};

const title = (text) => {
  console.log("");
  print(`╔${"═".repeat(62)}╗`, "cyan");
  print(`║  ${text.padEnd(59)}  ║`, "cyan");
  print(`╚${"═".repeat(62)}╝`, "cyan");
  console.log("");
};

// Commands
const commands = {
  verify: {
    description: "Run full MCP setup verification",
    action: () => {
      title("MCP Setup Verification");

      print("Checking prerequisites...", "yellow");

      const checks = [
        { name: "Node.js >= 18", cmd: "node --version" },
        {
          name: "drizzle.config.ts",
          test: () => fs.existsSync("packages/database/drizzle.config.ts"),
        },
        {
          name: "Schema files",
          test: () => {
            const schemaDir = "packages/database/src/schema";
            return fs.readdirSync(schemaDir).filter((f) => f.endsWith(".ts")).length;
          },
        },
      ];

      checks.forEach((check) => {
        try {
          if (check.test) {
            const result = check.test();
            print(`✓ ${check.name}: ${result}`, "green");
          } else if (check.cmd) {
            const result = require("child_process").execSync(check.cmd).toString().trim();
            print(`✓ ${check.name}: ${result}`, "green");
          }
        } catch (e) {
          print(`✗ ${check.name}: ${e.message}`, "red");
        }
      });

      console.log("");
      print("DATABASE_URL Status:", "cyan");
      if (process.env.DATABASE_URL) {
        const masked = process.env.DATABASE_URL.replace(/password=[^@]*/g, "password=***");
        print(`✓ Set: ${masked}`, "green");
      } else {
        print("✗ Not set (required for MCP server)", "yellow");
        print('  Set with: $env:DATABASE_URL = "postgresql://..."', "gray");
      }

      console.log("");
      print("MCP Setup Files:", "cyan");
      const files = [
        "packages/database/MCP_SETUP_GUIDE.md",
        "packages/database/MCP_VERIFICATION_CHECKLIST.md",
        "packages/database/MCP_SETUP_COMPLETE.md",
        "packages/database/package.json",
        "mcp-setup.ps1",
        "mcp-setup.sh",
      ];

      files.forEach((file) => {
        const exists = fs.existsSync(file);
        const icon = exists ? "✓" : "✗";
        const color = exists ? "green" : "red";
        print(`${icon} ${file}`, color);
      });
    },
  },

  start: {
    description: "Start MCP server (production mode)",
    action: () => {
      title("Starting Drizzle MCP Server");

      if (!process.env.DATABASE_URL) {
        print("⚠ DATABASE_URL not set!", "yellow");
        print("Setting default: postgresql://localhost:5432/klayk_dev", "yellow");
        process.env.DATABASE_URL = "postgresql://localhost:5432/klayk_dev";
      }

      print(
        `Using DATABASE_URL: ${process.env.DATABASE_URL.replace(/password=[^@]*/g, "password=***")}`,
        "gray",
      );
      console.log("");

      print("Starting server...", "yellow");
      console.log("");

      exec("npm run db:mcp", { cwd: "packages/database", stdio: "inherit" });
    },
  },

  "start-dev": {
    description: "Start MCP server with debug output",
    action: () => {
      title("Starting Drizzle MCP Server (DEBUG MODE)");

      if (!process.env.DATABASE_URL) {
        print("⚠ DATABASE_URL not set!", "yellow");
        process.env.DATABASE_URL = "postgresql://localhost:5432/klayk_dev";
      }

      print(
        `Using DATABASE_URL: ${process.env.DATABASE_URL.replace(/password=[^@]*/g, "password=***")}`,
        "gray",
      );
      print("Debug mode: ENABLED", "cyan");
      console.log("");

      process.env.DEBUG = "drizzle-mcp:*";
      print("Starting server with debug output...", "yellow");
      console.log("");

      exec("npm run db:mcp:dev", { cwd: "packages/database", stdio: "inherit" });
    },
  },

  docs: {
    description: "Show available documentation",
    action: () => {
      title("Available Documentation");

      const docs = [
        {
          file: "MCP_SETUP_GUIDE.md",
          path: "packages/database/MCP_SETUP_GUIDE.md",
          description: "Detailed 8-part setup guide with all instructions",
          sections: [
            "1. Introduction & Capabilities",
            "2. Database Configuration",
            "3. Database Connection Verification",
            "4. Running MCP Server",
            "5. Claude Desktop Integration",
            "6. Verification Steps",
            "7. Practical Examples",
            "8. Additional Resources",
          ],
        },
        {
          file: "MCP_VERIFICATION_CHECKLIST.md",
          path: "packages/database/MCP_VERIFICATION_CHECKLIST.md",
          description: "Step-by-step verification and testing guide",
          sections: [
            "Pre-Flight Checklist",
            "Step 1: DATABASE_URL Setup",
            "Step 2: Drizzle Module Verification",
            "Step 3: Database Connection Test",
            "Step 4: MCP Server Launch",
            "Step 5: Functionality Verification",
            "Step 6: Claude Desktop Integration",
            "Step 7: Practical Examples",
          ],
        },
        {
          file: "MCP_SETUP_COMPLETE.md",
          path: "packages/database/MCP_SETUP_COMPLETE.md",
          description: "Summary of what was done and quick start",
          sections: [
            "What Was Done",
            "Quick Start",
            "File Structure",
            "Practical Examples",
            "Security Notes",
            "Troubleshooting",
          ],
        },
      ];

      docs.forEach((doc, idx) => {
        const exists = fs.existsSync(doc.path);
        const color = exists ? "green" : "yellow";

        print(`\n${idx + 1}. ${doc.file}`, color);
        print(`   ${doc.description}`, "gray");

        if (doc.sections) {
          print(`   Sections:`, "gray");
          doc.sections.forEach((section) => {
            print(`     • ${section}`, "gray");
          });
        }
      });
    },
  },

  help: {
    description: "Show this help message",
    action: () => {
      title("Drizzle MCP Server - Commands");

      print("Usage: node mcp-commands.js [command]", "cyan");
      console.log("");

      print("Available Commands:", "yellow");
      Object.entries(commands).forEach(([cmd, config]) => {
        print(`  ${cmd.padEnd(15)} - ${config.description}`, "green");
      });

      console.log("");
      print("Quick Start:", "yellow");
      print("  1. node mcp-commands.js verify", "gray");
      print("  2. node mcp-commands.js start-dev", "gray");
      print("  3. Check Claude Desktop integration", "gray");

      console.log("");
      print("Platform-Specific Scripts:", "yellow");
      print("  Windows (PowerShell): .\\mcp-setup.ps1 -Start -Debug", "gray");
      print("  Unix/macOS (Bash):    ./mcp-setup.sh --start --debug", "gray");

      console.log("");
      print("Documentation:", "yellow");
      print("  node mcp-commands.js docs", "gray");
    },
  },
};

// Main entry point
const command = process.argv[2] || "help";

if (commands[command]) {
  try {
    commands[command].action();
  } catch (error) {
    print(`Error: ${error.message}`, "red");
    process.exit(1);
  }
} else {
  print(`Unknown command: ${command}`, "red");
  print('Run "node mcp-commands.js help" for available commands', "yellow");
  process.exit(1);
}
