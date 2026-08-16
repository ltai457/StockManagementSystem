using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RadiatorStockAPI.Migrations
{
    /// <inheritdoc />
    public partial class ProductTypeAndModelUpdates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "cost_price",
                table: "radiators");

            migrationBuilder.DropColumn(
                name: "is_price_overridable",
                table: "radiators");

            migrationBuilder.DropColumn(
                name: "max_discount_percent",
                table: "radiators");

            migrationBuilder.DropColumn(
                name: "retail_price",
                table: "radiators");

            migrationBuilder.DropColumn(
                name: "trade_price",
                table: "radiators");

            migrationBuilder.CreateTable(
                name: "product_types",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_product_types", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "ix_product_types_name",
                table: "product_types",
                column: "name",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "product_types");

            migrationBuilder.AddColumn<decimal>(
                name: "cost_price",
                table: "radiators",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_price_overridable",
                table: "radiators",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "max_discount_percent",
                table: "radiators",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "retail_price",
                table: "radiators",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "trade_price",
                table: "radiators",
                type: "numeric",
                nullable: true);
        }
    }
}
