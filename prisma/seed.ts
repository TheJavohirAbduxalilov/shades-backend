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

  const installer1 = await prisma.user.create({
    data: {
      username: "installer1",
      passwordHash,
      fullName: "Иван Петров",
      preferredLanguageCode: "ru",
    },
  });

  const installer2 = await prisma.user.create({
    data: {
      username: "installer2",
      passwordHash,
      fullName: "Сергей Иванов",
      preferredLanguageCode: "ru",
    },
  });

  // Создание демо заказов
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        clientName: "Алишер Каримов",
        clientPhone: "+998901234567",
        clientAddress: "ул. Навои 50, кв. 12, Ташкент",
        notes: "Домофон 12, звонить заранее",
        visitDate: new Date("2025-01-15"),
        status: "NEW",
        assignedUserId: 1,
      },
    }),
    prisma.order.create({
      data: {
        clientName: "Мадина Рахимова",
        clientPhone: "+998931112233",
        clientAddress: "ул. Амира Темура 88, Ташкент",
        notes: null,
        visitDate: new Date("2025-01-16"),
        status: "NEW",
        assignedUserId: 1,
      },
    }),
    prisma.order.create({
      data: {
        clientName: "Бахтиёр Усманов",
        clientPhone: "+998901119988",
        clientAddress: "ул. Бабура 25, кв. 5, Самарканд",
        notes: "Большие окна в гостиной",
        visitDate: new Date("2025-01-17"),
        status: "IN_PROGRESS",
        assignedUserId: 1,
      },
    }),
    prisma.order.create({
      data: {
        clientName: "Нилуфар Азимова",
        clientPhone: "+998881234567",
        clientAddress: "ул. Мустакиллик 100, Бухара",
        notes: "Офисное помещение, 6 окон",
        visitDate: new Date("2025-01-10"),
        status: "MEASURED",
        assignedUserId: 2,
      },
    }),
    prisma.order.create({
      data: {
        clientName: "Шухрат Назаров",
        clientPhone: "+998901010101",
        clientAddress: "ул. Алишера Навои 15, Наманган",
        notes: null,
        visitDate: new Date("2025-01-05"),
        status: "COMPLETED",
        assignedUserId: 2,
      },
    }),
  ]);

  console.log("Created orders:", orders.length);

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

  const horizontalOption1 = shadeTypeHorizontal.optionTypes[0];
  const horizontalOption2 = shadeTypeHorizontal.optionTypes[1];
  const verticalOption1 = shadeTypeVertical.optionTypes[0];
  const verticalOption2 = shadeTypeVertical.optionTypes[1];

  horizontalOption1.values.sort((a, b) => a.displayOrder - b.displayOrder);
  horizontalOption2.values.sort((a, b) => a.displayOrder - b.displayOrder);
  verticalOption1.values.sort((a, b) => a.displayOrder - b.displayOrder);
  verticalOption2.values.sort((a, b) => a.displayOrder - b.displayOrder);

  const fabricWhite = materialFabric.variants.find((variant) => variant.colorHex === "#FFFFFF");
  const fabricBeige = materialFabric.variants.find((variant) => variant.colorHex === "#F5F5DC");
  const plasticWhite = materialPlastic.variants[0];
  const woodNatural = materialWood.variants[0];

  if (!fabricWhite || !fabricBeige || !plasticWhite || !woodNatural) {
    throw new Error("Seed variants are not configured correctly.");
  }

  await prisma.order.create({
    data: {
      clientName: "Алишер Каримов",
      clientPhone: "+998901234567",
      clientAddress: "ул. Навои 50, кв. 12",
      notes: "Домофон 12",
      visitDate: new Date("2025-01-20"),
      status: OrderStatus.NEW,
      assignedUserId: installer1.id,
      windows: {
        create: [
          {
            name: "Окно 1",
            shades: {
              create: [
                {
                  shadeTypeId: shadeTypeHorizontal.id,
                  width: 150,
                  height: 180,
                  materialVariantId: fabricWhite.id,
                  installationIncluded: true,
                  removalIncluded: false,
                  options: {
                    create: [
                      {
                        optionTypeId: horizontalOption1.id,
                        optionValueId: horizontalOption1.values[0].id,
                      },
                      {
                        optionTypeId: horizontalOption2.id,
                        optionValueId: horizontalOption2.values[0].id,
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      clientName: "Мадина Умарова",
      clientPhone: "+998901112233",
      clientAddress: "ул. Мирзо Улугбек 10",
      notes: "Позвонить за час",
      visitDate: new Date("2025-01-18"),
      status: OrderStatus.IN_PROGRESS,
      assignedUserId: installer2.id,
      windows: {
        create: [
          {
            name: "Гостиная",
            shades: {
              create: [
                {
                  shadeTypeId: shadeTypeVertical.id,
                  width: 200,
                  height: 220,
                  materialVariantId: plasticWhite.id,
                  installationIncluded: true,
                  removalIncluded: true,
                  options: {
                    create: [
                      {
                        optionTypeId: verticalOption1.id,
                        optionValueId: verticalOption1.values[0].id,
                      },
                      {
                        optionTypeId: verticalOption2.id,
                        optionValueId: verticalOption2.values[1].id,
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            name: "Спальня",
            shades: {
              create: [
                {
                  shadeTypeId: shadeTypeHorizontal.id,
                  width: 130,
                  height: 170,
                  materialVariantId: fabricBeige.id,
                  installationIncluded: false,
                  removalIncluded: false,
                  options: {
                    create: [
                      {
                        optionTypeId: horizontalOption1.id,
                        optionValueId: horizontalOption1.values[1].id,
                      },
                      {
                        optionTypeId: horizontalOption2.id,
                        optionValueId: horizontalOption2.values[1].id,
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      clientName: "Шахзод Ахмедов",
      clientPhone: "+998907778899",
      clientAddress: "пр. Амира Темура 75",
      notes: "Охрана на входе",
      visitDate: new Date("2025-01-16"),
      status: OrderStatus.MEASURED,
      assignedUserId: installer1.id,
      windows: {
        create: [
          {
            name: "Кухня",
            shades: {
              create: [
                {
                  shadeTypeId: shadeTypeHorizontal.id,
                  width: 120,
                  height: 140,
                  materialVariantId: plasticWhite.id,
                  installationIncluded: false,
                  removalIncluded: false,
                  options: {
                    create: [
                      {
                        optionTypeId: horizontalOption1.id,
                        optionValueId: horizontalOption1.values[0].id,
                      },
                      {
                        optionTypeId: horizontalOption2.id,
                        optionValueId: horizontalOption2.values[0].id,
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      clientName: "Ольга Смирнова",
      clientPhone: "+998905556677",
      clientAddress: "ул. Чиланзар 22",
      notes: "Ключ у консьержа",
      visitDate: new Date("2025-01-12"),
      status: OrderStatus.COMPLETED,
      assignedUserId: installer2.id,
      windows: {
        create: [
          {
            name: "Балкон",
            shades: {
              create: [
                {
                  shadeTypeId: shadeTypeVertical.id,
                  width: 180,
                  height: 200,
                  materialVariantId: woodNatural.id,
                  installationIncluded: true,
                  removalIncluded: false,
                  options: {
                    create: [
                      {
                        optionTypeId: verticalOption1.id,
                        optionValueId: verticalOption1.values[1].id,
                      },
                      {
                        optionTypeId: verticalOption2.id,
                        optionValueId: verticalOption2.values[2].id,
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      clientName: "Фирюза Ниязова",
      clientPhone: "+998909991122",
      clientAddress: "ул. Янгийул 5",
      notes: null,
      visitDate: new Date("2025-01-22"),
      status: OrderStatus.NEW,
      assignedUserId: installer1.id,
      windows: {
        create: [
          {
            name: "Детская",
            shades: {
              create: [
                {
                  shadeTypeId: shadeTypeHorizontal.id,
                  width: 140,
                  height: 160,
                  materialVariantId: fabricWhite.id,
                  installationIncluded: false,
                  removalIncluded: true,
                  options: {
                    create: [
                      {
                        optionTypeId: horizontalOption1.id,
                        optionValueId: horizontalOption1.values[1].id,
                      },
                      {
                        optionTypeId: horizontalOption2.id,
                        optionValueId: horizontalOption2.values[0].id,
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });
};

seed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
