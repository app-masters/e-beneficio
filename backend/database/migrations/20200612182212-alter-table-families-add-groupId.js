'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'Families',
        'groupId',
        { type: Sequelize.INTEGER, references: { model: 'Groups', id: 'id' }, allowNull: true },
        { transaction }
      );

      /**
       * The table can be at a point thar the group table exists but don't have
       * any data in it, if that is the case, we need to make sure that all the
       * necessary to the migration to convert the `groupName` to `groupId` are
       * available.
       *
       * This query act as an seed for all the groups until this point and then
       * create a temporary table that associates the group name `groupName` to
       * the id in the new `Groups` table.
       *
       * After that, all the rows from the families table are updated, filling
       * the groupId field.
       */
      await queryInterface.sequelize.query(
        `
        do $$
        BEGIN 
          -- Certify that all groups exists
          IF NOT EXISTS(
            SELECT id FROM "Groups" WHERE "title" = 'Bolsa família com filho na escola pública'
          ) THEN
            INSERT INTO "Groups" ("title", "createdAt", "updatedAt" ) 
            VALUES ('Bolsa família com filho na escola pública', now(), now());
          END IF;
          
          IF NOT EXISTS(
            SELECT id FROM "Groups" WHERE "title" = 'Extrema pobreza'
          ) THEN
            INSERT INTO "Groups" ("title", "createdAt", "updatedAt" ) VALUES ('Extrema pobreza', now(), now());
          END IF;

          IF NOT EXISTS(
            SELECT id FROM "Groups" WHERE "title" = 'Linha da pobreza'
          ) THEN
            INSERT INTO "Groups" ("title", "createdAt", "updatedAt" ) VALUES ('Linha da pobreza', now(), now());
          END IF;

          IF NOT EXISTS(
            SELECT id FROM "Groups" WHERE "title" = 'Perfil CAD único'
          ) THEN
            INSERT INTO "Groups" ("title", "createdAt", "updatedAt" ) VALUES ('Perfil CAD único', now(), now());
          END IF;
          
          -- Create a temporary table linking the groupName and the groupId
          CREATE TABLE temp_group(
            "id"         INT4, 
            "groupName"  VARCHAR(255)
          );

          INSERT INTO "temp_group" ("id", "groupName") SELECT (SELECT id FROM "Groups" WHERE "title" = 'Bolsa família com filho na escola pública'), 'children' AS "groupName";
          INSERT INTO "temp_group" ("id", "groupName") SELECT (SELECT id FROM "Groups" WHERE "title" = 'Extrema pobreza'), 'extreme-poverty' AS "groupName";
          INSERT INTO "temp_group" ("id", "groupName") SELECT (SELECT id FROM "Groups" WHERE "title" = 'Linha da pobreza'), 'poverty-line' AS "groupName";
          INSERT INTO "temp_group" ("id", "groupName") SELECT (SELECT id FROM "Groups" WHERE "title" = 'Perfil CAD único'), 'cad' AS "groupName";

          -- Update the family table to match the id
          UPDATE "Families" F
          SET "groupId" = G."id"
          FROM "temp_group" G
            WHERE (F."groupName" = G."groupName");

          DROP TABLE temp_group;
            
          END
          $$;
        `,
        { transaction }
      );
      await queryInterface.changeColumn(
        'Families',
        'groupId',
        {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        { transaction }
      );
      await queryInterface.removeColumn('Families', 'groupName', { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'Families',
        'groupName',
        { type: Sequelize.STRING, allowNull: true },
        { transaction }
      );

      /**
       * The table can be at a point thar the group table exists but don't have
       * any data in it, if that is the case, we need to make sure that all the
       * necessary to the migration to convert the `groupName` to `groupId` are
       * available.
       *
       * This query act as an seed for all the groups until this point and then
       * create a temporary table that associates the group name `groupName` to
       * the id in the new `Groups` table.
       *
       * After that, all the rows from the families table are updated, filling
       * the groupId field.
       */
      await queryInterface.sequelize.query(
        `
        do $$
        BEGIN 
          -- Certify that all groups exists
          IF NOT EXISTS(
            SELECT id FROM "Groups" WHERE "title" = 'Bolsa família com filho na escola pública'
          ) THEN
            INSERT INTO "Groups" ("title", "createdAt", "updatedAt" ) 
            VALUES ('Bolsa família com filho na escola pública', now(), now());
          END IF;
          
          IF NOT EXISTS(
            SELECT id FROM "Groups" WHERE "title" = 'Extrema pobreza'
          ) THEN
            INSERT INTO "Groups" ("title", "createdAt", "updatedAt" ) VALUES ('Extrema pobreza', now(), now());
          END IF;

          IF NOT EXISTS(
            SELECT id FROM "Groups" WHERE "title" = 'Linha da pobreza'
          ) THEN
            INSERT INTO "Groups" ("title", "createdAt", "updatedAt" ) VALUES ('Linha da pobreza', now(), now());
          END IF;

          IF NOT EXISTS(
            SELECT id FROM "Groups" WHERE "title" = 'Perfil CAD único'
          ) THEN
            INSERT INTO "Groups" ("title", "createdAt", "updatedAt" ) VALUES ('Perfil CAD único', now(), now());
          END IF;
          
          -- Create a temporary table linking the groupName and the groupId
          CREATE TABLE temp_group(
            "id"         INT4, 
            "groupName"  VARCHAR(255)
          );

          INSERT INTO "temp_group" ("id", "groupName") SELECT (SELECT id FROM "Groups" WHERE "title" = 'Bolsa família com filho na escola pública'), 'children' AS "groupName";
          INSERT INTO "temp_group" ("id", "groupName") SELECT (SELECT id FROM "Groups" WHERE "title" = 'Extrema pobreza'), 'extreme-poverty' AS "groupName";
          INSERT INTO "temp_group" ("id", "groupName") SELECT (SELECT id FROM "Groups" WHERE "title" = 'Linha da pobreza'), 'poverty-line' AS "groupName";
          INSERT INTO "temp_group" ("id", "groupName") SELECT (SELECT id FROM "Groups" WHERE "title" = 'Perfil CAD único'), 'cad' AS "groupName";

          -- Update the family table to match the id
          UPDATE "Families" F
          SET "groupName" = G."groupName"
          FROM "temp_group" G
            WHERE (F."groupId" = G."id");

          DROP TABLE temp_group;
            
          END
          $$;
        `,
        { transaction }
      );
      await queryInterface.changeColumn(
        'Families',
        'groupName',
        {
          type: Sequelize.STRING,
          allowNull: false
        },
        { transaction }
      );
      await queryInterface.removeColumn('Families', 'groupId', { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
