import { PrismaClient, OrderStatus, ServiceType } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

type LanguageCode = "ru" | "uz_cyrl" | "uz_latn";

const LANGUAGES: LanguageCode[] = ["ru", "uz_cyrl", "uz_latn"];

const makeNameTranslations = (names: Record<LanguageCode, string>) =>
  LANGUAGES.map((code) => ({
    languageCode: code,
    name: names[code],
  }));

const makeColorTranslations = (names: Record<LanguageCode, string>) =>
  LANGUAGES.map((code) => ({
    languageCode: code,
    colorName: names[code],
  }));

const makeStatusTranslations = (names: Record<LanguageCode, string>, status: OrderStatus) =>
  LANGUAGES.map((code) => ({
    languageCode: code,
    name: names[code],
    status,
  }));

const resetDatabase = async () => {
  await prisma.$transaction([
    prisma.shadeOption.deleteMany(),
    prisma.shade.deleteMany(),
    prisma.window.deleteMany(),
    prisma.order.deleteMany(),
    prisma.materialVariantTranslation.deleteMany(),
    prisma.materialVariant.deleteMany(),
    prisma.materialTranslation.deleteMany(),
    prisma.material.deleteMany(),
    prisma.optionValueTranslation.deleteMany(),
    prisma.optionValue.deleteMany(),
    prisma.optionTypeTranslation.deleteMany(),
    prisma.optionType.deleteMany(),
    prisma.shadeTypeTranslation.deleteMany(),
    prisma.shadeTypeMaterial.deleteMany(),
    prisma.shadeType.deleteMany(),
    prisma.servicePriceTranslation.deleteMany(),
    prisma.servicePrice.deleteMany(),
    prisma.orderStatusTranslation.deleteMany(),
    prisma.user.deleteMany(),
    prisma.language.deleteMany(),
  ]);
};

const seed = async () => {
  await resetDatabase();

  await prisma.language.createMany({
    data: [
      { code: "ru", name: "Русский", isDefault: true },
      { code: "uz_cyrl", name: "Ўзбекча (кириллица)", isDefault: false },
      { code: "uz_latn", name: "O'zbekcha (lotin)", isDefault: false },
    ],
  });

  const passwordHash = await bcrypt.hash("123456", 10);

  const user1 = await prisma.user.upsert({
    where: { username: "installer1" },
    update: {},
    create: {
      username: "installer1",
      passwordHash,
      fullName: "Иван Петров",
      preferredLanguageCode: "ru",
    },
  });

  const user2 = await prisma.user.upsert({
    where: { username: "installer2" },
    update: {},
    create: {
      username: "installer2",
      passwordHash,
      fullName: "Алексей Сидоров",
      preferredLanguageCode: "ru",
    },
  });

  console.log("Created users:", user1.id, user2.id);

  const shadeTypeHorizontal = await prisma.shadeType.create({
    data: {
      minPrice: 100000,
      translations: {
        create: makeNameTranslations({
          ru: "Горизонтальные",
          uz_cyrl: "Горизонтал",
          uz_latn: "Gorizontal",
        }),
      },
      optionTypes: {
        create: [
          {
            displayOrder: 1,
            translations: {
              create: makeNameTranslations({
                ru: "Место установки",
                uz_cyrl: "Ўрнатиш жойи",
                uz_latn: "O'rnatish joyi",
              }),
            },
            values: {
              create: [
                {
                  displayOrder: 1,
                  translations: {
                    create: makeNameTranslations({
                      ru: "На створку",
                      uz_cyrl: "Қанотга",
                      uz_latn: "Qanotga",
                    }),
                  },
                },
                {
                  displayOrder: 2,
                  translations: {
                    create: makeNameTranslations({
                      ru: "На проем",
                      uz_cyrl: "Проёмга",
                      uz_latn: "Proyomga",
                    }),
                  },
                },
              ],
            },
          },
          {
            displayOrder: 2,
            translations: {
              create: makeNameTranslations({
                ru: "Сторона управления",
                uz_cyrl: "Бошқарув томони",
                uz_latn: "Boshqaruv tomoni",
              }),
            },
            values: {
              create: [
                {
                  displayOrder: 1,
                  translations: {
                    create: makeNameTranslations({
                      ru: "Правая",
                      uz_cyrl: "Ўнг",
                      uz_latn: "O'ng",
                    }),
                  },
                },
                {
                  displayOrder: 2,
                  translations: {
                    create: makeNameTranslations({
                      ru: "Левая",
                      uz_cyrl: "Чап",
                      uz_latn: "Chap",
                    }),
                  },
                },
              ],
            },
          },
        ],
      },
    },
    include: {
      optionTypes: {
        include: { values: true },
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  const shadeTypeVertical = await prisma.shadeType.create({
    data: {
      minPrice: 120000,
      translations: {
        create: makeNameTranslations({
          ru: "Вертикальные",
          uz_cyrl: "Вертикал",
          uz_latn: "Vertikal",
        }),
      },
      optionTypes: {
        create: [
          {
            displayOrder: 1,
            translations: {
              create: makeNameTranslations({
                ru: "Способ крепления",
                uz_cyrl: "Махкамлаш усули",
                uz_latn: "Mahkamlash usuli",
              }),
            },
            values: {
              create: [
                {
                  displayOrder: 1,
                  translations: {
                    create: makeNameTranslations({
                      ru: "Потолок",
                      uz_cyrl: "Шип",
                      uz_latn: "Ship",
                    }),
                  },
                },
                {
                  displayOrder: 2,
                  translations: {
                    create: makeNameTranslations({
                      ru: "Стена",
                      uz_cyrl: "Девор",
                      uz_latn: "Devor",
                    }),
                  },
                },
              ],
            },
          },
          {
            displayOrder: 2,
            translations: {
              create: makeNameTranslations({
                ru: "Тип раздвижки",
                uz_cyrl: "Силжиш тури",
                uz_latn: "Siljish turi",
              }),
            },
            values: {
              create: [
                {
                  displayOrder: 1,
                  translations: {
                    create: makeNameTranslations({
                      ru: "К механизму управления",
                      uz_cyrl: "Бошқарув механизмига",
                      uz_latn: "Boshqaruv mexanizmiga",
                    }),
                  },
                },
                {
                  displayOrder: 2,
                  translations: {
                    create: makeNameTranslations({
                      ru: "От центра в две стороны",
                      uz_cyrl: "Марказдан икки томонга",
                      uz_latn: "Markazdan ikki tomonga",
                    }),
                  },
                },
                {
                  displayOrder: 3,
                  translations: {
                    create: makeNameTranslations({
                      ru: "От механизма управления",
                      uz_cyrl: "Бошқарув механизмидан",
                      uz_latn: "Boshqaruv mexanizmidan",
                    }),
                  },
                },
              ],
            },
          },
        ],
      },
    },
    include: {
      optionTypes: {
        include: { values: true },
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  const materialFabric = await prisma.material.create({
    data: {
      translations: {
        create: makeNameTranslations({
          ru: "Ткань",
          uz_cyrl: "Мато",
          uz_latn: "Mato",
        }),
      },
      variants: {
        create: [
          {
            colorHex: "#FFFFFF",
            pricePerSqm: 80000,
            translations: {
              create: makeColorTranslations({
                ru: "Белый",
                uz_cyrl: "Оқ",
                uz_latn: "Oq",
              }),
            },
          },
          {
            colorHex: "#F5F5DC",
            pricePerSqm: 85000,
            translations: {
              create: makeColorTranslations({
                ru: "Бежевый",
                uz_cyrl: "Беж",
                uz_latn: "Bej",
              }),
            },
          },
        ],
      },
    },
    include: { variants: true },
  });

  const materialPlastic = await prisma.material.create({
    data: {
      translations: {
        create: makeNameTranslations({
          ru: "Пластик",
          uz_cyrl: "Пластик",
          uz_latn: "Plastik",
        }),
      },
      variants: {
        create: [
          {
            colorHex: "#FFFFFF",
            pricePerSqm: 60000,
            translations: {
              create: makeColorTranslations({
                ru: "Белый",
                uz_cyrl: "Оқ",
                uz_latn: "Oq",
              }),
            },
          },
        ],
      },
    },
    include: { variants: true },
  });

  const materialWood = await prisma.material.create({
    data: {
      translations: {
        create: makeNameTranslations({
          ru: "Дерево",
          uz_cyrl: "Ёғоч",
          uz_latn: "Yog'och",
        }),
      },
      variants: {
        create: [
          {
            colorHex: "#D4A574",
            pricePerSqm: 150000,
            translations: {
              create: makeColorTranslations({
                ru: "Натуральный дуб",
                uz_cyrl: "Табиий эман",
                uz_latn: "Tabiiy eman",
              }),
            },
          },
        ],
      },
    },
    include: { variants: true },
  });

  await prisma.shadeTypeMaterial.createMany({
    data: [
      { shadeTypeId: shadeTypeHorizontal.id, materialId: materialFabric.id },
      { shadeTypeId: shadeTypeHorizontal.id, materialId: materialPlastic.id },
      { shadeTypeId: shadeTypeHorizontal.id, materialId: materialWood.id },
      { shadeTypeId: shadeTypeVertical.id, materialId: materialFabric.id },
      { shadeTypeId: shadeTypeVertical.id, materialId: materialPlastic.id },
    ],
  });

  await prisma.servicePrice.create({
    data: {
      serviceType: ServiceType.INSTALLATION,
      price: 50000,
      translations: {
        create: makeNameTranslations({
          ru: "Монтаж",
          uz_cyrl: "Ўрнатиш",
          uz_latn: "O'rnatish",
        }),
      },
    },
  });

  await prisma.servicePrice.create({
    data: {
      serviceType: ServiceType.REMOVAL,
      price: 30000,
      translations: {
        create: makeNameTranslations({
          ru: "Демонтаж",
          uz_cyrl: "Демонтаж",
          uz_latn: "Demontaj",
        }),
      },
    },
  });

  const statusTranslations = [
    ...makeStatusTranslations(
      {
        ru: "Новый",
        uz_cyrl: "Янги",
        uz_latn: "Yangi",
      },
      OrderStatus.NEW
    ),
    ...makeStatusTranslations(
      {
        ru: "В работе",
        uz_cyrl: "Ишда",
        uz_latn: "Ishda",
      },
      OrderStatus.IN_PROGRESS
    ),
    ...makeStatusTranslations(
      {
        ru: "Замер выполнен",
        uz_cyrl: "Ўлчов қилинди",
        uz_latn: "O'lchov qilindi",
      },
      OrderStatus.MEASURED
    ),
    ...makeStatusTranslations(
      {
        ru: "Завершен",
        uz_cyrl: "Якунланган",
        uz_latn: "Yakunlangan",
      },
      OrderStatus.COMPLETED
    ),
  ];

  await prisma.orderStatusTranslation.createMany({
    data: statusTranslations,
  });

  await prisma.order.createMany({
    data: [
      {
        clientName: "Алишер Каримов",
        clientPhone: "+998901234567",
        clientAddress: "ул. Навои 50, кв. 12, Ташкент",
        notes: "Домофон 12",
        visitDate: new Date("2025-01-15"),
        status: "NEW",
        assignedUserId: user1.id,
      },
      {
        clientName: "Мадина Рахимова",
        clientPhone: "+998931112233",
        clientAddress: "ул. Амира Темура 88, Ташкент",
        notes: null,
        visitDate: new Date("2025-01-16"),
        status: "NEW",
        assignedUserId: user1.id,
      },
      {
        clientName: "Бахтиёр Усманов",
        clientPhone: "+998901119988",
        clientAddress: "ул. Бабура 25, Самарканд",
        notes: "Большие окна",
        visitDate: new Date("2025-01-17"),
        status: "IN_PROGRESS",
        assignedUserId: user1.id,
      },
      {
        clientName: "Нилуфар Азимова",
        clientPhone: "+998881234567",
        clientAddress: "ул. Мустакиллик 100, Бухара",
        notes: "Офис, 6 окон",
        visitDate: new Date("2025-01-10"),
        status: "MEASURED",
        assignedUserId: user2.id,
      },
      {
        clientName: "Шухрат Назаров",
        clientPhone: "+998901010101",
        clientAddress: "ул. Навои 15, Наманган",
        notes: null,
        visitDate: new Date("2025-01-05"),
        status: "COMPLETED",
        assignedUserId: user2.id,
      },
    ],
  });

  console.log("Created 5 demo orders");
};

seed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
