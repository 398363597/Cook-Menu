# Cook_Menu 数据模型

## 1. 数据实体关系

第一版以 `Recipe` 为核心实体，其他内容优先内嵌在菜谱中，便于本地存储和表单编辑。

```text
Recipe
├─ image: RecipeImage
├─ ingredients: Ingredient[]
├─ seasonings: Seasoning[]
├─ steps: CookingStep[]
├─ category: RecipeCategory
├─ tasteTags: TasteTag[]
└─ lessons: RecipeLesson
```

实体关系说明：

- `Recipe`：一道个人菜谱，是第一版唯一核心数据。
- `Ingredient`：食材列表，和调料分开存储。
- `Seasoning`：调料列表，独立于食材。
- `CookingStep`：有序做菜步骤。
- `RecipeCategory`：分类筛选字段，第一版建议单选。
- `TasteTag`：轻量口味标签，可选，不做复杂标签系统。
- `RecipeLesson`：失败经验 / 下次改进，始终存在，可为空字符串。
- `LocalAppState`：本地应用状态，例如当前 schema 版本、分类筛选值。

## 2. 字段说明

### Recipe

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | `string` | 菜谱唯一 ID，建议使用 `crypto.randomUUID()` |
| `name` | `string` | 菜名 |
| `image` | `RecipeImage \| null` | 菜谱图片，支持本地 base64、blob、未来文件路径 |
| `category` | `RecipeCategory` | 第一版单分类 |
| `description` | `string` | 简短描述或列表页备注 |
| `difficulty` | `RecipeDifficulty` | 难度，可选枚举 |
| `cookTimeMinutes` | `number \| null` | 预计用时，单位分钟 |
| `servings` | `number \| null` | 份量 |
| `ingredients` | `Ingredient[]` | 食材列表 |
| `seasonings` | `Seasoning[]` | 调料列表 |
| `steps` | `CookingStep[]` | 有序步骤 |
| `tasteTags` | `TasteTag[]` | 轻量口味标签 |
| `status` | `RecipeStatus` | 常做 / 想尝试 / 已踩坑 |
| `lessons` | `RecipeLesson` | 失败经验和下次改进 |
| `notes` | `string` | 其他备注 |
| `createdAt` | `string` | ISO 时间 |
| `updatedAt` | `string` | ISO 时间 |

### Ingredient / Seasoning

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | `string` | 条目 ID |
| `name` | `string` | 名称 |
| `amount` | `string` | 用量，第一版用字符串更适合表单，例如 `2`、`适量` |
| `unit` | `string` | 单位，例如 `个`、`克`、`勺` |
| `note` | `string` | 备注，例如 `切丝`、`提前焯水` |

### CookingStep

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | `string` | 步骤 ID |
| `order` | `number` | 步骤顺序，从 1 开始 |
| `text` | `string` | 步骤正文 |
| `image` | `RecipeImage \| null` | 步骤图片，第一版可选 |
| `timerMinutes` | `number \| null` | 计时提醒，单位分钟 |
| `note` | `string` | 步骤备注 |

### RecipeLesson

| 字段 | 类型 | 说明 |
|---|---|---|
| `failureNotes` | `string` | 失败经验，例如太咸、火太大 |
| `nextImprovements` | `string` | 下次改进，例如少放盐、提前腌制 |

## 3. TypeScript 类型定义

```ts
export type RecipeCategory =
  | "breakfast"
  | "home_cooking"
  | "quick_dish"
  | "soup_porridge"
  | "noodles"
  | "other";

export type RecipeDifficulty = "easy" | "medium" | "hard";

export type RecipeStatus = "regular" | "want_to_try" | "needs_improvement";

export type ImageStorageType = "base64" | "blob_url" | "file_path" | "remote_url";

export interface RecipeImage {
  id: string;
  storageType: ImageStorageType;
  src: string;
  alt: string;
  createdAt: string;
}

export interface Ingredient {
  id: string;
  name: string;
  amount: string;
  unit: string;
  note: string;
}

export interface Seasoning {
  id: string;
  name: string;
  amount: string;
  unit: string;
  note: string;
}

export interface CookingStep {
  id: string;
  order: number;
  text: string;
  image: RecipeImage | null;
  timerMinutes: number | null;
  note: string;
}

export interface TasteTag {
  id: string;
  name: string;
}

export interface RecipeLesson {
  failureNotes: string;
  nextImprovements: string;
}

export interface Recipe {
  id: string;
  name: string;
  image: RecipeImage | null;
  category: RecipeCategory;
  description: string;
  difficulty: RecipeDifficulty;
  cookTimeMinutes: number | null;
  servings: number | null;
  ingredients: Ingredient[];
  seasonings: Seasoning[];
  steps: CookingStep[];
  tasteTags: TasteTag[];
  status: RecipeStatus;
  lessons: RecipeLesson;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface LocalAppState {
  schemaVersion: number;
  selectedCategory: RecipeCategory | "all";
  searchKeyword: string;
  lastOpenedRecipeId: string | null;
  updatedAt: string;
}

export interface CookMenuLocalDatabase {
  schemaVersion: number;
  recipes: Recipe[];
  appState: LocalAppState;
}
```

## 4. 示例 JSON

```json
{
  "schemaVersion": 1,
  "recipes": [
    {
      "id": "recipe-001",
      "name": "番茄鸡蛋面",
      "image": {
        "id": "image-001",
        "storageType": "base64",
        "src": "data:image/jpeg;base64,...",
        "alt": "番茄鸡蛋面成品图",
        "createdAt": "2026-06-17T10:00:00.000Z"
      },
      "category": "noodles",
      "description": "十分钟能做好的家常面。",
      "difficulty": "easy",
      "cookTimeMinutes": 10,
      "servings": 1,
      "ingredients": [
        {
          "id": "ingredient-001",
          "name": "面条",
          "amount": "1",
          "unit": "人份",
          "note": ""
        },
        {
          "id": "ingredient-002",
          "name": "番茄",
          "amount": "1",
          "unit": "个",
          "note": "切小块"
        },
        {
          "id": "ingredient-003",
          "name": "鸡蛋",
          "amount": "2",
          "unit": "个",
          "note": "打散"
        }
      ],
      "seasonings": [
        {
          "id": "seasoning-001",
          "name": "盐",
          "amount": "少许",
          "unit": "",
          "note": "最后再调味"
        },
        {
          "id": "seasoning-002",
          "name": "生抽",
          "amount": "1",
          "unit": "勺",
          "note": ""
        }
      ],
      "steps": [
        {
          "id": "step-001",
          "order": 1,
          "text": "热锅倒油，先炒鸡蛋，凝固后盛出。",
          "image": null,
          "timerMinutes": null,
          "note": ""
        },
        {
          "id": "step-002",
          "order": 2,
          "text": "下番茄炒出汁，加水煮开。",
          "image": null,
          "timerMinutes": 3,
          "note": "番茄可以多炒一会儿，汤更浓。"
        },
        {
          "id": "step-003",
          "order": 3,
          "text": "放入面条，快熟时加入鸡蛋、盐和生抽。",
          "image": null,
          "timerMinutes": 5,
          "note": ""
        }
      ],
      "tasteTags": [
        {
          "id": "tag-001",
          "name": "酸甜"
        },
        {
          "id": "tag-002",
          "name": "快手"
        }
      ],
      "status": "regular",
      "lessons": {
        "failureNotes": "上次盐放早了，汤越煮越咸。",
        "nextImprovements": "下次最后起锅前再放盐，先尝味道。"
      },
      "notes": "适合没时间做饭的时候。",
      "createdAt": "2026-06-17T10:00:00.000Z",
      "updatedAt": "2026-06-17T10:00:00.000Z"
    }
  ],
  "appState": {
    "schemaVersion": 1,
    "selectedCategory": "all",
    "searchKeyword": "",
    "lastOpenedRecipeId": "recipe-001",
    "updatedAt": "2026-06-17T10:00:00.000Z"
  }
}
```

## 5. 本地存储建议

第一版建议优先使用 `IndexedDB`，原因是菜谱图片可能较大，`localStorage` 容量和同步写入都不太适合长期保存图片。

推荐结构：

- `cook_menu_db`
- object store: `recipes`
- object store: `app_state`
- object store: `meta`

如果为了 MVP 极简启动，也可以先用 `localStorage` 存纯 JSON，但图片应尽量压缩；一旦支持多张图片或较多菜谱，应迁移到 `IndexedDB`。

本地 key 建议：

```ts
const STORAGE_KEYS = {
  localStorageSnapshot: "cook_menu:v1:snapshot",
  schemaVersion: "cook_menu:schema_version"
};
```

图片建议：

- MVP 可先存 `base64`，实现最简单。
- 如果图片变多，改为 IndexedDB 存 Blob，`RecipeImage.src` 存图片记录 ID 或 object URL。
- 保留 `storageType`，方便未来从 `base64` 迁移到 `file_path` 或 Blob。

## 6. 数据迁移建议

从第一版开始就保留 `schemaVersion`，即使当前只有 `1`。

建议迁移函数：

```ts
export function migrateDatabase(raw: unknown): CookMenuLocalDatabase {
  const data = raw as Partial<CookMenuLocalDatabase>;

  if (!data.schemaVersion) {
    return {
      schemaVersion: 1,
      recipes: [],
      appState: {
        schemaVersion: 1,
        selectedCategory: "all",
        searchKeyword: "",
        lastOpenedRecipeId: null,
        updatedAt: new Date().toISOString()
      }
    };
  }

  if (data.schemaVersion === 1) {
    return data as CookMenuLocalDatabase;
  }

  throw new Error(`Unsupported schema version: ${data.schemaVersion}`);
}
```

迁移原则：

- 新字段尽量提供默认值，避免旧菜谱打不开。
- 删除字段要谨慎，优先保留兼容读取。
- 图片迁移单独处理，避免一次性转换失败导致菜谱文本丢失。
- 每次保存时更新 `updatedAt`。
- 删除菜谱第一版可以直接删除；如果担心误删，后续再增加 `deletedAt` 做软删除。

## 7. 给 UI 设计 Agent 的交接说明

UI 第一版可以围绕 `Recipe` 表单直接设计，不需要复杂的数据关系页。

重点界面建议：

- 菜谱列表卡片展示：`image`、`name`、`category`、`description` 或 `lessons.nextImprovements`。
- 分类筛选使用单选：早餐、家常菜、快手菜、汤粥、面食、其他、全部。
- 新增 / 编辑表单必须把 `ingredients` 和 `seasonings` 分成两个独立区块。
- 步骤区块使用有序列表，每条步骤包含正文、可选图片、可选计时、备注。
- 失败经验和下次改进建议在详情页突出展示，尤其适合放在步骤后方。
- 图片上传控件第一版只需要支持一张成品图；步骤图可以作为可选增强。
- 不需要设计登录、头像、关注、点赞、评论、发布、隐私权限等社区或账号相关界面。

